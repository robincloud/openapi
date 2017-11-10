const EventEmitter = require('events');
const schedule = require('node-schedule');
const Settings = require('./settings');
const CustomError = require('./custom-error');
const Item = require('../models/item');
require('./polyfills');    // For some unimplemented functions on older version of Node.js


// Scan 200 items per every 0.5 second whenever queued items are less than (1000 - 200)
const MAX_QUEUE_SIZE = 1000;
const SCAN_SIZE = 200;
const SCAN_INTERVAL_MSEC = 500;

// Fetched items(tasks) will be regarded as dropped after timed out. Dropped items are queued again to processed later.
const PROCESSING_TIMEOUT_MSEC = (3 * 60 * 1000);  // 3 minutes


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
		const projection = 'id';

		return Item.scan(size, projection, fromId)
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
		this.on('timeout', this._onTimeout);

		// Scheduling (cron-based) - Default schedule is 'AT EVERY HOUR ON THE HOUR'
		const scheduleCallback = () => { this._wakeup(); };
		this._scheduledJob = schedule.scheduleJob('00 * * * *', scheduleCallback);

		// For scanning items
		this._tScanItems = null;
		this._scannedQueue = [];
		this._retryQueue = [];
		this._idScanFrom = null;

		// For retry mechanism
		const timeoutCallback = (agent, items) => { this.emit('timeout', agent, items); };
		this._timeout = new TaskTimeoutHandler(PROCESSING_TIMEOUT_MSEC, timeoutCallback);

		// For statistics
		const nextSchedule = this._scheduledJob.nextInvocation();
		this._stats = new TaskStatistics(nextSchedule);
	}

	get available() { return (this._scannedQueue.length + this._retryQueue.length); }

	isBusy() {
		return (this._tScanItems || this.available);
	}

	forceTrigger(dataSource) {
		return new Promise((resolve) => {
			// Do nothing if it is already running
			if (!this.isBusy()) {
				//this._scheduledJob.cancelNext(true);  // TODO: Not working as expected
				//this._scheduledJob.reschedule('00 * * * *');
				this._wakeup(dataSource);
			}

			resolve({
				current_event: this._stats.started,
				next_event: this._stats.scheduled
			});
		});
	}

	fetchItems(agent, size = 1) {
		return new Promise((resolve, reject) => {
			this.emit('fetch', agent, size, (err, items) => {
				if (err) reject(err);
				else resolve(items);
			});
		});
	}

	returnItem(agent, itemId) {
		return new Promise((resolve, reject) => {
			this.emit('process', agent, itemId, (err) => {
				if (err) reject(err);
				else resolve();
			});
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
		this._scannedQueue = [];
		this._retryQueue = [];
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
				this.emit('scan', items);

				// Suspend fetch task if no more items are left
				if (dataSource.isEmpty()) {
					this._suspend();
				}
			})
			.catch((err) => {
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
		if (!Array.isArray(items)) items = new Array(items);

		this._scannedQueue = this._scannedQueue.concat(items);
		this._stats.addScanned(items.length);
	}

	_onFetch(agent, size, callback) {
		let items = [];

		// First get items from retry queue
		if (this._retryQueue.length) {
			const retryItems = this._retryQueue.splice(0, size);
			items = items.concat(retryItems);
			size -= retryItems.length;
		}
		// Next get items from scanned queue
		if (size > 0) {
			const normalItems = this._scannedQueue.splice(0, size);
			items = items.concat(normalItems);
			this._stats.addFetched(agent, normalItems.length);
		}

		this._timeout.watch(agent, items);  // Enable timeout timer

		// Mark as fetching finished
		if (items.length && !this.available) {
			this._stats.markAsFetchFinished();
		}

		callback(null, items);
	}

	_onProcess(agent, itemId, callback) {
		this._timeout.unwatch(agent, itemId);    // Disable timeout timer
		this._stats.addProcessed(agent, 1);

		// Mark as processing finished
		if (!this.available && this._timeout.isEmpty()) {
			this._stats.markAsProcessFinished();
		}

		callback(null);
	}

	_onTimeout(agent, items) {
		this._retryQueue = this._retryQueue.concat(items);
		this._stats.addTimeout(agent, items.length);
	}
}


// TaskTimeoutHandler class
class TaskTimeoutHandler {
	constructor(msTimeout, callback) {
		const msCheckInterval = 1000;    // Check timeout every 1 sec

		this.maxWindows = Math.ceil(msTimeout / msCheckInterval);
		this.windows = [{}];

		const checkCallback = (callback) => { this._check(callback); };
		setInterval(checkCallback, msCheckInterval, callback);
	}

	isEmpty() {
		return this.windows.reduce((empty, window) => {
			const isWindowEmpty = Object.values(window).every((agentMap) => agentMap.size === 0);
			return (empty && isWindowEmpty);
		}, true);
	}

	watch(agent, items) {
		const getAgentMap = (agent) => {
			let agentMap;
			const curWindow = this.windows[this.windows.length - 1];

			if (agent in curWindow) {
				agentMap = curWindow[agent];
			} else {
				agentMap = new Map();
				curWindow[agent] = agentMap;
			}

			return agentMap;
		};

		setImmediate(() => {
			const agentMap = getAgentMap(agent);
			items.forEach((item) => {
				agentMap.set(item.get('id'), item);
			});
		});
	}

	unwatch(agent, itemId) {
		setImmediate(() => {
			for (const window of this.windows) {
				if (!(agent in window)) continue;

				const agentMap = window[agent];
				if (agentMap.has(itemId)) {
					agentMap.delete(itemId);
					break;
				}
			}
		});
	}


	_check(callback) {
		const fMapValues = (map) => { return Array.from(map.values()); };

		if (this.windows.length === this.maxWindows) {
			const expiredWindow = this.windows.shift();

			Object.entries(expiredWindow).forEach(([agent, agentMap]) => {
				const items = fMapValues(agentMap);
				if (items.length) {
					callback(agent, items);
				}
			});
		}

		this.windows.push({});    // Insert a new window
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

	get started()   { return this.events.started; }
	get scheduled() { return this.events.nextScheduled; }

	markAsStarted(nextSchedule) {
		this.events.started = new Date();
		this.events.nextScheduled = nextSchedule;
	}

	markAsScanFinished() {
		if (this.events.started > this.events.finishedScan) {
			this.events.finishedScan = new Date();
		}
	}

	markAsFetchFinished() {
		if (this.events.finishedScan > this.events.finishedFetch) {
			this.events.finishedFetch = new Date();
		}
	}

	markAsProcessFinished() {
		if (this.events.finishedFetch > this.events.finishedProcess) {
			this.events.finishedProcess = new Date();
		}
	}

	addScanned(count) {
		this.counter.totalScanned += count;
	}

	addFetched(agent, count) {
		const agents = this.counter.agents;
		if (!(agent in agents)) {
			agents[agent] = {
				fetched: 0,
				processed: 0,
				timeout: 0
			}
		}
		agents[agent].fetched += count;
	}

	addProcessed(agent, count) {
		const agents = this.counter.agents;
		if (!(agent in agents)) {
			// WARNING: Could not be here if agent name is correct!
			agents[agent] = {
				fetched: 0,
				processed: 0,
				timeout: 0
			}
		}
		agents[agent].processed += count;
	}

	addTimeout(agent, count) {
		const agents = this.counter.agents;
		if (!(agent in agents)) {
			// WARNING: Could not be here if agent name is correct!
			agents[agent] = {
				fetched: 0,
				processed: 0,
				timeout: 0
			}
		}
		agents[agent].timeout += count;
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

		// List of agents
		const agents = Object.keys(this.counter.agents);

		// Generate total counts of all agents
		const counts = {
			scanned: this.counter.totalScanned,
			fetched: 0,
			processed: 0,
			timeout: 0
		};
		Object.values(this.counter.agents).forEach((agent) => {
			counts.fetched += agent.fetched;
			counts.processed += agent.processed;
			counts.timeout += agent.timeout;
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
			agents,
			counts,
			throughput
		};
	}

	getAgentDetail(agent) {
		if (!(agent in this.counter.agents)) {
			throw new CustomError.AgentNotFound(agent);
		}

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
		return `${throughput} items/sec`;
	}
}


// TaskService class - Facade of TaskManager
class TaskService {
	constructor() {
		this._manager = new TaskManager();
	}

	forceTrigger() {
		return this._manager.forceTrigger();
	}

	getTasks(agent, size = 1) {
		if (!agent) {
			const err = new CustomError.InvalidArgument('missing required parameter (agent)');
			return Promise.reject(err);
		}

		return Promise.all([
			this.getClientVersion(),
			this._manager.fetchItems(agent, size)
		])
		.then(([clientVersion, items]) => {
			return items.map((item) => {
				const id = item.get('id');
				const mid = (id.split('_')[1] || '');
				return {clientVersion, id, mid};
			});
		});
	}

	releaseTask(agent, itemId) {
		if (!agent) {
			const err = new CustomError.InvalidArgument('missing required parameter (agent)');
			return Promise.reject(err);
		}

		return this._manager.returnItem(agent, itemId);
	}

	getStatsSync(agent = null) {
		return this._manager.getStats(agent);
	}

	getStatsAsync(agent = null) {
		return new Promise((resolve, reject) => {
			try {
				resolve(this._manager.getStats(agent));
			} catch (err) {
				reject(err);
			}
		});
	}

	getClientVersion() {
		return Settings.load('clientVersion');
	}

	setClientVersion(newVersion) {
		return this.getClientVersion()
		.then((curVersion) => {
			if (!newVersion) {
				newVersion = (Number(curVersion) || 0) + 1;
			}
			if (newVersion === curVersion) {
				return Promise.resolve(newVersion); // Do not save if the value is not changed
			} else {
				return Settings.save('clientVersion', newVersion)
				.then(() => newVersion);
			}
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
		taskService._manager.forceTrigger(new DummyDataSource());

		// Start 5 consumers
		const fTask = (agent) => {
			return setInterval(() => {
				taskService.getTasks(agent, 12)
				.then((items) => {
					const stats = taskService.getStatsSync();
					console.log(`---------------------------------------------`);
					console.log(`${JSON.stringify(stats, null, 4)}`);

					items.forEach((item) => {
						taskService.releaseTask(agent, item['id']);
					});
				});
			}, 200);
		};
		const tasks = [1, 2, 3, 4, 5].map((num) => {
			return fTask(`agent${num}`);
		});

		setTimeout(() => {
			tasks.forEach(clearInterval);
		}, 10000);
	}
}

TaskServiceTester.launch();
*/
