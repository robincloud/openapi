const TaskService = require('../services/tasks');
const HttpResponse = require('../services/http-response');


const requestTasks = (req, res) => {
	const {agent, size = 1} = (req.query || {});
	const httpResponse = new HttpResponse();

	TaskService.requestTasks(agent, size)
	.then((tasks) => {
		httpResponse.setData(tasks);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	})
	.catch((err) => {
		httpResponse.setError(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};

const getStats = (req, res) => {
	const {agent = null} = req.params;
	const httpResponse = new HttpResponse();

	TaskService.getStatsAsync(agent)
	.then((stats) => {
		httpResponse.setData(stats);
		res.status(httpResponse.statusCode).json(httpResponse.body);
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
		res.status(httpResponse.statusCode).json(httpResponse.body);
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
	getStats,
	getClientVersion,
	setClientVersion
};
