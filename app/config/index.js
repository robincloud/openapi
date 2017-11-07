const AWS = require('aws-sdk');
const commandLineArgs = require('command-line-args');


// Check the existence of AWS credentials
AWS.config.getCredentials((err) => {
	if (err) throw err;
	if (!AWS.config.credentials || !AWS.config.credentials.accessKeyId) {
		throw new Error('AWS credentials are required.');
	}
	console.log(AWS.config.credentials);
});

// Configuration values
const CONFIGS = [
	{name: 'jwtSecret'},
	{name: 'serverUrl', defaultValue: 'localhost:8081'}
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
    {name: 'host', alias: 'h', type: String},
    {name: 'port', alias: 'p', type: Number, defaultValue: 8081},
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

if (config['serverUrl']) {
	const [host, port] = config['serverUrl'].split(':');
	config['host'] = host;
	if (port && !isNaN(Number(port))) config['port'] = Number(port);
} else if (config['host']) {
	if (config['port']) {
		config['serverUrl'] = `${config['host']}:${config['port']}`;
	} else {
		config['serverUrl'] = config['host'];
	}
} else {
	throw new Error(`Server URL is required (Set environment variable 'SERVER_URL'.)`);
}


console.log(config);
module.exports = config;
