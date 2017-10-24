const commandLineArgs = require('command-line-args');


// Following config values must be provided for launch
const MANDATORY_CONFIGS = [
	'awsAccessKeyId',
	'awsSecretAccessKey',
	'jwtSecret',
	'server'
];


// Runtime user environment
const environment = {};
MANDATORY_CONFIGS.forEach((envName) => {
	let envValue = process.env[envName];
	if (!envValue) {
		envValue = process.env[envName.replace(/([A-Z])/g, "_$1").toUpperCase()];
	}

	if (envValue) environment[envName] = envValue;
});


// Command line arguments
const optionDefinitions = [
    {name: 'endpoint', alias: 'e', type: String, defaultValue: 'http://localhost:8000'},
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


// Merge configurations from options top of environment variables
const config = Object.assign(environment, options);
// MANDATORY_CONFIGS.forEach((envName) => {
// 	if (!config[envName]) {
// 		throw new Error(`Required configuration value (${envName}) is missing.`);
// 	}
// });


module.exports = config;

