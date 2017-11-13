const url = require('url');
const AWS = require('aws-sdk');
const request = require('request');
const commandLineArgs = require('command-line-args');


class Config {
	static initialize() {
		// Set AWS region
		AWS.config.region = 'ap-northeast-2';

		// Merge environment variables and command line arguments
		// Command line arguments can override environment variables
		const envs = Config._getEnvVars();
		const opts = Config._getOptions();
		const configs = Object.assign(envs, opts);

		// Set configs to this object
		Object.entries(configs).forEach(([key, value]) => {
			this[key] = value;
		});

		// Reconstruct server URL
		if (opts['port']) {
			const urlObject = url.parse(envs['serverUrl']);
			urlObject.port = opts['port'];
			this['serverUrl'] = url.format(urlObject);
		}

		return Config._validateConfigs()
		.then(() => Config._isMaster()) // Check whether this server instance is master or not
		.then((isMaster) => {
			this['master'] = isMaster;
		});
	}


	static _getEnvVars() {
		// Environment variables to evaluate
		const envDefinitions = [
			{name: 'jwtSecret'},
			{name: 'serverUrl', defaultValue: 'localhost:8081'},
			{name: 'cacheUrl', defaultValue: 'localhost:11211'},
			{name: 'port', defaultValue: 8081},

			// TODO: This is temporary settings for email service. Real server has AWS credentials that have no permission to send email!
			{name: 'sesAccessKeyId'},
			{name: 'sesSecretAccessKey'}
		];

		// Runtime user environment
		const envs = {};
		envDefinitions.forEach(({name, defaultValue}) => {
			let value;

			// Proceed with camel case first
			value = process.env[name];
			// Proceed with underscored case again if not found
			if (value === undefined) {
				value = process.env[name.replace(/([A-Z])/g, "_$1").toUpperCase()];
			}
			// Finally Set default value
			if (value === undefined) {
				value = defaultValue;
			}

			if (value !== undefined) {
				envs[name] = value;
			}
		});

		return envs;
	}

	static _getOptions() {
		// Command line arguments to evaluate
		const optionDefinitions = [
			{name: 'jwtSecret', type: String},
			{name: 'port', alias: 'p', type: Number},
			{name: 'verbose', alias: 'v', type: Boolean, defaultValue: false}
		];

		return commandLineArgs(optionDefinitions);
	}

	static _validateConfigs() {
		return new Promise((resolve, reject) => {
			AWS.config.getCredentials((err) => {
				if (err) {
					reject(err);
				} else if (!AWS.config.credentials || !AWS.config.credentials.accessKeyId) {
					reject(new Error('AWS credentials are required.'));
				} else {
					// Check mandatory parameters are properly set
					if (!this['jwtSecret']) {
						reject(new Error(`JWT secret is required (Set environment variable 'JWT_SECRET'.)`));
					} else {
						resolve();
					}
				}
			});
		});
	}

	static _isMaster() {
		return new Promise((resolve, reject) => {
			const url = 'http://instance-data/latest/meta-data/ami-launch-index/';
			request(url, (err, response, body) => {
				if (err) {
					// ENOTFOUND could be occurred if the application is not launched on AWS instances (e.g. localhost)
					if (err['errno'] === 'ENOTFOUND') resolve(true);
					else reject(err);
				}
				else if (response.statusCode !== 200) {
					reject(new Error('unable to get AMI launch index'));
				}
				else {
					// Regard as master if AMI launch index is 0
					resolve(body === '0');
				}
			});
		});
	}
}


module.exports = Config;
