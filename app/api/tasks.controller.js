const TaskService = require('../services/tasks');
const HttpResponse = require('../services/http-response');


const requestTasks = (req, res) => {
	const {agent, size = 1} = (req.query || {});
	const httpResponse = new HttpResponse();

	TaskService.requestTasks(agent, size)
	.then((tasks) => {
		httpResponse.setData(tasks);
		res.json(httpResponse.body);
	})
	.catch((err) => {
		httpResponse.setError(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};

const getStatsAll = (req, res) => {
	const httpResponse = new HttpResponse();

	TaskService.getStats()
	.then((stats) => {
		httpResponse.setData(stats);
		res.json(httpResponse.body);
	})
	.catch((err) => {
		httpResponse.setError(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};

const getStatsAgent = (req, res) => {
	const {agent = ''} = req.params;
	const httpResponse = new HttpResponse();

	TaskService.getStats(agent)
	.then((stats) => {
		httpResponse.setData(stats);
		res.json(httpResponse.body);
	})
	.catch((err) => {
		httpResponse.setError(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};

const getClientVersion = (req, res) => {
	const httpResponse = new HttpResponse();

	TaskService.getClientVersion()
	.then((version) => {
		httpResponse.setData({
			clientVersion: version
		});
		res.json(httpResponse.body);
	})
	.catch((err) => {
		httpResponse.setError(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};

const setClientVersion = (req, res) => {
	const version = req.params.version;
	const httpResponse = new HttpResponse();

	TaskService.setClientVersion(version)
	.then(() => {
		httpResponse.setData({
			clientVersion: version
		});
		res.json(httpResponse.body);
	})
	.catch((err) => {
		httpResponse.setError(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};


module.exports = {
	requestTasks,
	getStatsAll,
	getStatsAgent,
	getClientVersion,
	setClientVersion
};
