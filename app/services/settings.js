const Memcached = require('memcached-elasticache');
const Setting = require('../models/setting');
const CustomError = require('./custom-error');


class Settings {
	constructor() {
		const memcachedServer = 'oneprice-api.nk1r9f.cfg.apn2.cache.amazonaws.com:11211';
		this._memcached = new Memcached();
		this._memcached = new Memcached(memcachedServer, {retries: 1});
	}

	load(key) {
		if (!key) {
			return Promise.reject(new CustomError.ServerError('Setting key is required.'));
		}

		// Find the hit: Cache -> DB -> Default
		return this._loadFromCache(key)
		.then((value) => {
			return value ? value : this._loadFromDB(key);
		})
		.then((value) => {
			return value ? value : this._loadDefaultValue(key);
		});
	}

	save(key, value) {
		if (!key) {
			return Promise.reject(new CustomError.ServerError('Setting key is required.'));
		}

		return this._saveToCache(key, value)        // Save to cache
		.then(() => this._saveToDB(key, value));    // Save to DB
	}


	_loadFromCache(key) {
		return new Promise((resolve, reject) => {
			this._memcached.get(key, (err, value = null) => {
				if (err) reject(new CustomError.ServerError(err.message, err.name));
				else resolve(value);
			});
		});
	}

	_saveToCache(key, value) {
		const expired = 0;  // Never expired

		return new Promise((resolve, reject) => {
			this._memcached.set(key, value, expired, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});
	}

	_loadFromDB(key) {
		return Setting.find(key)
		.then((value) => {
			if (!value) {
				return value;
			}

			return this._saveToCache(key, value)    // Save to cache
			.then(() => value);
		});
	}

	_saveToDB(key, value) {
		return new Setting(key, value).save();
	}

	_loadDefaultValue(key) {
		const defaultValues = {
			clientVersion: '1'
		};

		const value = (defaultValues[key] || null);
		if (!value) {
			return Promise.resolve(value);
		}

		return this._saveToDB(key, value)           // Save to DB
		.then(() => this._saveToCache(key, value))  // Save to cache
		.then(() => value);
	}
}


module.exports = new Settings;
