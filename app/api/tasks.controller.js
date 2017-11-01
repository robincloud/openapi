const TaskService = require('../services/tasks');


const ErrorName = 'TaskService error';


const requestTasks = (req, res) => {
	const {agent, size = 1} = (req.query || {});
	if (!agent) return res.status(400).json('Required parameter (agent) is missing.');

	TaskService.requestTasks(agent, size)
	.then((tasks) => {
		res.json(tasks);
	})
	.catch((err) => {
		res.status(500).json({
			status: 'Internal Server Error',
			title: (err.name || ErrorName),
			detail: err.message
		});
	});
};


const getStatsAll = (req, res) => {
	TaskService.getStats()
	.then((stats) => {
		res.json(stats);
	})
	.catch((err) => {
		res.status(500).json({
			status: 'Internal Server Error',
			title: (err.name || ErrorName),
			detail: err.message
		});
	});
};


const getStatsAgent = (req, res) => {
	const {agent = ''} = req.params;

	TaskService.getStats(agent)
	.then((stats) => {
		res.json(stats);
	})
	.catch((err) => {
		res.status(500).json({
			status: 'Internal Server Error',
			title: (err.name || ErrorName),
			detail: err.message
		});
	});
};


const getClientVersion = (req, res) => {
	TaskService.getClientVersion()
	.then((version) => {
		res.json({
			clientVersion: version
		});
	})
	.catch((err) => {
		res.status(500).json({
			status: 'Internal Server Error',
			title: (err.name || ErrorName),
			detail: err.message
		});
	});
};


const setClientVersion = (req, res) => {
	const version = req.params.version;
	if (!version) return res.status(400).json('Required parameter (version) is missing.');

	TaskService.setClientVersion(version)
	.then(() => {
		res.json({
			clientVersion: version
		});
	})
	.catch((err) => {
		res.status(500).json({
			status: 'Internal Server Error',
			title: (err.name || ErrorName),
			detail: err.message
		});
	});
};


module.exports = {
	requestTasks,
	getStatsAll,
	getStatsAgent,
	getClientVersion,
	setClientVersion
};
