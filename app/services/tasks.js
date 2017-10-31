const EventEmitter = require('events');
const schedule = require('node-schedule');
const Item = require('../models/item');

// Scan 300 items per every 1 second whenever queued items are less than (1000 - 300)
const MAX_QUEUE_SIZE = 1000;
const SCAN_SIZE = 300;
const SCAN_INTERVAL_MSEC = 1000;


// TaskManager class - Handle fetching and consuming of items
class TaskManager extends EventEmitter {
	constructor() {
		super();

		// Register event listeners for synchronization
		this.on('fetch', this._fetch);
		this.on('consume', this._consume);

		// Private variables
		this._tFetchItems = null;    // Timer object for fetching tasks
		this._totalFetched = 0;
		this._totalConsumed = 0;
		this._itemQueue = [];
		this._idScanFrom = null;

		// Scheduling (cron-based) - Default schedule is 'AT EVERY HOUR ON THE HOUR'
		this._scheduledJob = schedule.scheduleJob('00 * * * *', this._wakeup);
	}

	get fetched()   { return this._totalFetched; }
	get consumed()  { return this._totalConsumed; }
	get available() { return this._itemQueue.length; }

	isBusy() {
		return (this._tFetchItems || this.available);
	}

	forceTrigger() {
		if (this.isBusy()) return;  // Do nothing if it is already running

		//this._scheduledJob.cancelNext(true);          // TODO: Not working as expected
		//this._scheduledJob.reschedule('00 * * * *');
		this._wakeup();
	}

	popTasks(size = 1) {
		return new Promise((resolve, reject) => {
			const haveListeners = this.emit('consume', size, resolve);
			if (!haveListeners) {
				reject(new Error(`No handlers had been registered for 'consume' event.`));
			}
		});
	}


	///////////////////////////////////////////////////////////////////////////
	// Private methods

	_wakeup() {
		// Prevent two or more jobs working simultaneously
		if (this.isBusy()) return;

		// Initialize
		this._totalFetched = 0;
		this._totalConsumed = 0;
		this._itemQueue = [];
		this._idScanFrom = null;

		// Schedule the scanning task
		this._tFetchItems = setInterval(() => {
			if (this.available >= (MAX_QUEUE_SIZE - SCAN_SIZE)) return;

			const fromId = this._idScanFrom;
			Item.scan(SCAN_SIZE, fromId)
			.then((result) => {
				// Verify count of items
				if (result.count !== result.items.length) {
					throw new Error(`Count of fetched items is not match.`);
				}

				// Emit 'fetch' event - TaskManager._fetch() will be invoked
				const haveListeners = this.emit('fetch', result.items);
				if (!haveListeners) {
					throw new Error(`No handlers had been registered for 'fetch' event.`);
				}

				// Suspend fetch timer if no more items are left
				if (result.last) {
					this._suspend();
				}
				// Otherwise save the ID of the beginning of next scan
				else {
					if (!result.nextId) {
						throw new Error(`'nextId' value is not set even though there are more items to scan.`);
					}
					this._idScanFrom = result.nextId;
				}
			});
		}, SCAN_INTERVAL_MSEC);
	}

	_suspend() {
		clearInterval(this._tFetchItems);
		this._tFetchItems = null;
	}

	_fetch(items) {
		this._itemQueue = this._itemQueue.concat(items);
		this._totalFetched += items.length;
	}

	_consume(size, resolve) {
		const itemsToConsume = this._itemQueue.splice(0, size);
		this._totalConsumed += itemsToConsume.length;

		resolve(itemsToConsume);
	}
}


// TaskService - Facade of TaskManager
class TaskService {
	constructor() {
		this._manager = new TaskManager();
	}

	requestTasks(agent, size = 1) {
		return this._manager.popTasks(size)
		.then((items) => {
			return items.map((item) => {
				const mid = item.id;
				return {id: `nv_${mid}`, mid};
			});
		});
	}

	getStats(agent = null) {

	}
}


module.exports = new TaskService();
