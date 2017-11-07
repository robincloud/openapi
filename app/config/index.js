const AWS = require('aws-sdk');
const commandLineArgs = require('command-line-args');


// Check the existence of AWS credentials
if (!AWS.config.credentials || !AWS.config.credentials.accessKeyId) {
	throw new Error('AWS credentials are required.');
}

// Configuration values
const CONFIGS = [
	'jwtSecret',
    'server',
    'endpoint',
    'port',
];

// Runtime user environment
const environment = {};
CONFIGS.forEach((envName) => {
	// Proceed with camel case first
	let envValue = process.env[envName];
	// Proceed with underscored case again if not found
	if (!envValue) {
		envValue = process.env[envName.replace(/([A-Z])/g, "_$1").toUpperCase()];
	}

	if (envValue) environment[envName] = envValue;
});


// Command line arguments
const optionDefinitions = [
    {name: 'server', alias: 's', type: String, defaultValue: 'localhost:8081'},
    {name: 'port', alias: 'p', type: Number, defaultValue: '8081'},
	{name: 'verbose', alias: 'v', type: Boolean, defaultValue: false}
];
CONFIGS
.filter((envName) => {
	// Filter out configurations that are already in option definitions
	const found = optionDefinitions.find((optionDefinition) => {
		return (optionDefinition.name === envName);
	});
	return (found === undefined);
})
.forEach((envName) => {
	optionDefinitions.push({
		name: envName,
		type: String
	});
});
const options = commandLineArgs(optionDefinitions);

// Merge configurations from environment variables to options
const config = Object.assign(environment, options);

// Check mandatory parameter is properly set
if (!config['jwtSecret']) {
	throw new Error('JWT secret is required.');
}


console.log(config);
module.exports = config;
