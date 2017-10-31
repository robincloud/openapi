const TaskService = require('../services/tasks');


const requestTasks = (req, res) => {
	const {agent, size = 1} = (req.query || {});
	if (!agent) return res.status(400).json('Required parameter (agent) is missing.');

	TaskService.requestTasks(agent, size)
	.then((tasks) => {
		res.json(tasks);
	})
	.catch((err) => {
		res.status(500).json(err.message);
	});
};


const getStatsAll = (req, res) => {
	TaskService.getStats()
	.then((stats) => {
		res.json(stats);
	})
	.catch((err) => {
		res.status(500).json(err.message);
	});
};


const getStatsAgent = (req, res) => {
	const {agent = ''} = req.params;
	TaskService.getStats(agent)
	.then((stats) => {
		res.json(stats);
	})
	.catch((err) => {
		res.status(500).json(err.message);
	});
};


module.exports = {
	requestTasks,
	getStatsAll,
	getStatsAgent
};
