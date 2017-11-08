const url = require('url');
const AWS = require('aws-sdk');
const commandLineArgs = require('command-line-args');


// Set AWS region
AWS.config.region = 'ap-northeast-2';

// Check the existence of AWS credentials
AWS.config.getCredentials((err) => {
	if (err) throw err;
	if (!AWS.config.credentials || !AWS.config.credentials.accessKeyId) {
		throw new Error('AWS credentials are required.');
	}
});

// Configuration values
const CONFIGS = [
	{name: 'jwtSecret'},
	{name: 'serverUrl', defaultValue: 'localhost:8081'},
	{name: 'port', defaultValue: 8081},

	// TODO: This is temporary settings for email service. Real server has AWS credentials that have no permission to send email!
	{name: 'sesAccessKeyId'},
	{name: 'sesSecretAccessKey'}
];

// Runtime user environment
const envs = {};
CONFIGS.forEach(({name, defaultValue}) => {
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

// Command line arguments
const optionDefinitions = [
	{name: 'jwtSecret', type: String},
    {name: 'port', alias: 'p', type: Number},
	{name: 'verbose', alias: 'v', type: Boolean, defaultValue: false}
];
const options = commandLineArgs(optionDefinitions);

// Merge environment variables and command line arguments
// Command line arguments can override environment variables
const config = Object.assign(envs, options);

// Check mandatory parameter is properly set
if (!config['jwtSecret']) {
	throw new Error(`JWT secret is required (Set environment variable 'JWT_SECRET'.)`);
}

// Reconstruct server URL
if (options['port']) {
	const urlObject = url.parse(envs['serverUrl']);
	urlObject.port = options['port'];
	config['serverUrl'] = url.format(urlObject);
}


console.log(config);
module.exports = config;
