const EventEmitter = require('events');
const Memcached = require('memcached');
const schedule = require('node-schedule');
const Config = require('../config');
const CustomError = require('./custom-error');
const Item = require('../models/item');

// Scan 200 items per every 0.5 second whenever queued items are less than (1000 - 200)
const MAX_QUEUE_SIZE = 1000;
const SCAN_SIZE = 200;
const SCAN_INTERVAL_MSEC = 500;


// DataSource interface
class DataSource {
	isEmpty() { return true; }

	get(size) {
		return Promise.resolve([]);
	}
}


// ItemModelDataSource class
class ItemModelDataSource extends DataSource {
	constructor() {
		super();
		this._idScanFrom = null;
		this._finished = false;
	}

	isEmpty() {
		return this._finished;
	}

	get(size) {
		const fromId = this._idScanFrom;

		return Item.scan(size, fromId)
		.then((result) => {
			// Verify count of items
			if (result.count !== result.items.length) {
				throw new CustomError.ServerError(`not matching fetched items count`, 'DataSourceError');
			}

			// Mark finished if final flag is set
			if (result.final) {
				this._finished = true;
			}
			// Otherwise save the ID of the beginning of next scan
			else {
				if (!result.nextId) {
					throw new CustomError.ServerError(`missing 'nextId' value in scan result`, 'DataSourceError');
				}
				this._idScanFrom = result.nextId;
			}

			return result.items;
		});
	}
}


// TaskManager class - Handle fetching and consuming of items
class TaskManager extends EventEmitter {
	constructor() {
		super();

		// Register event listeners for synchronization
		this.on('scan', this._onScan);
		this.on('fetch', this._onFetch);
		this.on('process', this._onProcess);

		// Scheduling (cron-based) - Default schedule is 'AT EVERY HOUR ON THE HOUR'
		const scheduleHandler = this._wakeup.bind(this);
		this._scheduledJob = schedule.scheduleJob('00 * * * *', scheduleHandler);

		// For scanning items
		this._tScanItems = null;
		this._itemQueue = [];
		this._idScanFrom = null;

		// For statistics
		const nextSchedule = this._scheduledJob.nextInvocation();
		this._stats = new TaskStatistics(nextSchedule);
	}

	get available() { return this._itemQueue.length; }

	isBusy() {
		return (this._tScanItems || this.available);
	}

	forceTrigger(dataSource) {
		if (this.isBusy()) return;  // Do nothing if it is already running

		//this._scheduledJob.cancelNext(true);          // TODO: Not working as expected
		//this._scheduledJob.reschedule('00 * * * *');
		this._wakeup(dataSource);
	}

	fetchItems(agent, size = 1) {
		return new Promise((resolve, reject) => {
			const haveListeners = this.emit('fetch', agent, size, (err, items) => {
				if (err) reject(err);
				else resolve(items);
			});
			if (!haveListeners) {
				reject(new CustomError.ServerError(`no handler for 'fetch' event`, 'TaskManagerError'));
			}
		});
	}

	getStats(agent) {
		return (agent ? this._stats.getAgentDetail(agent) : this._stats.getOverview());
	}


	///////////////////////////////////////////////////////////////////////////
	// Private methods

	_wakeup(dataSource = new ItemModelDataSource()) {
		// Prevent two or more jobs working simultaneously
		if (this.isBusy()) return;

		// Initialize
		this._itemQueue = [];
		this._idScanFrom = null;

		// Mark as started and update next schedule
		const nextSchedule = this._scheduledJob.nextInvocation();
		this._stats.markAsStarted(nextSchedule);

		// Enable scanning task
		this._tScanItems = setInterval(() => {
			// Enough amount of items are already in queue
			if (this.available > (MAX_QUEUE_SIZE - SCAN_SIZE)) return;

			dataSource.get(SCAN_SIZE)
			.then((items) => {
				// Emit 'scan' event - TaskManager._onScan() will be invoked
				const haveListeners = this.emit('scan', items);
				if (!haveListeners) {
					throw new CustomError.ServerError(`no handler for 'scan' event`, 'TaskManagerError');
				}

				// Suspend fetch task if no more items are left
				if (dataSource.isEmpty()) {
					this._suspend();
				}
			}).catch((err) => {
				console.error(err);
				this._suspend();
			});
		}, SCAN_INTERVAL_MSEC);
	}

	_suspend() {
		// Disable scanning task
		clearInterval(this._tScanItems);
		this._tScanItems = null;

		// Mark as scanning finished
		this._stats.markAsScanFinished();
	}

	_onScan(items) {
		this._itemQueue = this._itemQueue.concat(items);
		this._stats.addScanned(items.length);
	}

	_onFetch(agent, size, callback) {
		const itemsToProcess = this._itemQueue.splice(0, size);
		this._stats.addFetched(agent, itemsToProcess.length);

		// Mark as fetching finished
		if (itemsToProcess.length && !this.available) {
			this._stats.markAsFetchFinished();
		}

		callback(null, itemsToProcess);
	}

	_onProcess(agent, id) {
		// TODO
	}
}


// TaskStatistics class
class TaskStatistics {
	constructor(nextSchedule) {
		this.events = {
			started: null,
			finishedScan: null,
			finishedFetch: null,
			finishedProcess: null,
			nextScheduled: nextSchedule
		};
		this.counter = {
			totalScanned: 0,
			agents: {}
		};
	}

	markAsStarted(nextSchedule) {
		this.events.started = new Date();
		this.events.nextScheduled = nextSchedule;
	}

	markAsScanFinished() {
		this.events.finishedScan = new Date();
	}

	markAsFetchFinished() {
		this.events.finishedFetch = new Date();
	}

	markAsProcessFinished() {
		this.events.finishedFetch = new Date();
	}

	addScanned(count) {
		this.counter.totalScanned += count;
	}

	addFetched(agent, count) {
		const agents = this.counter.agents;
		if (!(agent in agents)) {
			agents[agent] = {
				fetched: 0,
				processed: 0
			}
		}
		agents[agent].fetched += count;
	}

	addProcessed(agent, count) {
		const agents = this.counter.agents;
		agents[agent].processed += count;
	}

	getOverview() {
		const now = new Date();

		// Time events
		const elapsed = TaskStatistics._elapsed(this.events.started, now);
		const current_events = {
			started: this.events.started,
			finished_scan: this.events.finishedScan,
			finished_fetch: this.events.finishedFetch,
			finished_process: this.events.finishedProcess,
			elapsed: TaskStatistics._msecToString(elapsed)
		};

		// Generate total counts of all agents
		const counts = {
			scanned: this.counter.totalScanned,
			fetched: 0,
			processed: 0
		};
		Object.values(this.counter.agents).forEach((agent) => {
			counts.fetched += agent.fetched;
			counts.processed += agent.processed;
		});

		// Calculate throughput
		const scanElapsed = TaskStatistics._elapsed(this.events.started, this.events.finishedScan);
		const processElapsed = TaskStatistics._elapsed(this.events.started, this.events.finishedProcess);
		const throughput = {
			scan: TaskStatistics._throughput(counts.scanned, scanElapsed),
			process: TaskStatistics._throughput(counts.processed, processElapsed)
		};

		// Return summarized statistics
		return {
			status: (this.events.started && !this.events.finishedProcess) ? 'running' : 'idle',
			current_events,
			next_event: this.events.nextScheduled,
			counts,
			throughput
		};
	}

	getAgentDetail(agent) {
		const elapsed = TaskStatistics._elapsed(this.events.started, this.events.finishedProcess);
		const counts = this.counter.agents[agent];

		return {
			events: {
				started: this.events.started,
				finished: this.events.finishedProcess,
				elapsed: TaskStatistics._msecToString(elapsed)
			},
			counts,
			throughput: TaskStatistics._throughput(counts.processed, elapsed)
		};
	}


	static _elapsed(start, end) {
		return (start ? (end || new Date()) - start : 0);
	}

	static _msecToString(time) {
		const pad = (num, space = 2) => {
			let padded = String(num);
			while (padded.length < space) padded = '0' + padded;
			return padded;
		};

		const ms = time % 1000;
		time = (time - ms) / 1000;
		const s = time % 60;
		time = (time - s) / 60;
		const m = time % 60;
		time = (time - m) / 60;
		const h = time;

		return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
	}

	static _throughput(count, msec) {
		const throughput = (msec ? Math.round(count / msec * 1000 * 100) / 100 : 0);
		return `${throughput} processed/sec`;
	}
}


// TaskService class - Facade of TaskManager
class TaskService {
	constructor() {
		this._manager = new TaskManager();

		const memcachedServer = `${Config['server']}:11211`;
		this._memcached = new Memcached(memcachedServer, {retries: 1});
	}

	requestTasks(agent, size = 1) {
		if (!agent) {
			const err = new CustomError.InvalidArgument('missing required parameter (agent)');
			return Promise.reject(err);
		}

		return this._manager.fetchItems(agent, size)
		.then((items) => {
			return items.map((item) => {
				const id = item.get('id');
				const mid = (id.split('_')[1] || '');
				return {id, mid};
			});
		});
	}

	getStatsSync(agent = null) {
		return this._manager.getStats(agent);
	}

	getStatsAsync(agent = null) {
		return new Promise((resolve) => {
			resolve(this._manager.getStats(agent));
		});
	}

	getClientVersion() {
		return new Promise((resolve, reject) => {
			this._memcached.get('clientVersion', (err, data = 1) => {
				if (err) reject(new CustomError.ServerError(err.message, err.name));
				else resolve(data);
			});
		});
	}

	setClientVersion(version) {
		if (!version) {
			throw new CustomError.InvalidArgument('missing required parameter (version)');
		}
		const expired = 0;  // Never expired

		return new Promise((resolve, reject) => {
			this._memcached.set('clientVersion', version, expired, (err) => {
				if (err) reject(new CustomError.ServerError(err.message, err.name));
				else resolve();
			});
		});
	}
}


module.exports = new TaskService();


// FOR TEST PURPOSE
/*
class DummyDataSource extends DataSource {
	constructor() {
		super();

		// Initialize dummy items
		this._items = [];
		for (let i = 1000; i < 3000; ++i) {
			this._items.push(new Item({
				id: `nv_${i}`
			}));
		}
	}

	isEmpty() {
		return (this._items.length === 0);
	}

	get(size) {
		const items = this._items.splice(0, size);
		return Promise.resolve(items);
	}
}

class TaskServiceTester {
	static launch() {
		// Start producer
		const taskService = new TaskService();
		taskService._manager.forceTrigger(new ItemModelDataSource());

		// Start 5 consumers
		const requestTasks = (agent) => {
			return setInterval(() => {
				taskService.requestTasks(agent, 12)
				.then((items) => {
					const stats = taskService.getStatsSync('agent1');
					console.log(`---------------------------------------------`);
					console.log(`${JSON.stringify(stats, null, 4)}`);
					console.log(items);
				});
			}, 200);
		};
		const tasks = [1, 2, 3, 4, 5].map((num) => {
			return requestTasks(`agent${num}`);
		});

		setTimeout(() => {
			tasks.forEach(clearInterval);
		}, 10000);
	}
}

TaskServiceTester.launch();
*/
