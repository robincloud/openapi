const commandLineArgs = require('command-line-args');


// Following config values must be provided for launch
const MANDATORY_CONFIGS = [
	'awsAccessKeyId',
	'awsSecretAccessKey',
	'jwtSecret',
];

// Following config values are optional with default value
const CONFIGS = [
    'server',
    'endpoint',
    'port',
];

// Runtime user environment
const environment = {};
MANDATORY_CONFIGS.concat(CONFIGS).forEach((envName) => {
	let envValue = process.env[envName];
	if (!envValue) {
		envValue = process.env[envName.replace(/([A-Z])/g, "_$1").toUpperCase()];
	}

	if (envValue) environment[envName] = envValue;
});


// Command line arguments
const optionDefinitions = [
    {name: 'server', alias: 's', type: String, defaultValue: 'localhost'},
    {name: 'port', alias: 'p', type: Number, defaultValue: '8090'},
	{name: 'verbose', alias: 'v', type: Boolean, defaultValue: false}
];
MANDATORY_CONFIGS.forEach((envName) => {
	optionDefinitions.push({
		name: envName,
		type: String
	});
});
const options = commandLineArgs(optionDefinitions);

// Merge configurations from environment variables to options
const config = Object.assign(options, environment);

console.log(config);

// MANDATORY_CONFIGS.forEach((envName) => {
// 	if (!config[envName]) {
// 		throw new Error(`Required configuration value (${envName}) is missing.`);
// 	}
// });


module.exports = config;

