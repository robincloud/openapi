const AuthService = require('../services/auth');
const HttpResponse = require('../services/http-response');


const signup = (req, res) => {
	const {email, passphrase} = req.body;
	const httpResponse = new HttpResponse();

	AuthService.signup(email, passphrase)
	.then((user) => {
		httpResponse.setData(user, 201);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	})
	.catch((err) => {
		httpResponse.setError(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};

const login = (req, res) => {
	const {email, passphrase} = req.body;
	const httpResponse = new HttpResponse();

	AuthService.login(email, passphrase)
	.then((token) => {
		httpResponse.setData({access_token: token});
		res.status(httpResponse.statusCode).json(httpResponse.body);
	})
	.catch((err) => {
		httpResponse.setError(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};

const verify = (req, res) => {
	const token = (req.headers['x-access-token'] || req.query['access_token']);
	const httpResponse = new HttpResponse();

	AuthService.verify(token)
	.then((payload) => {
		httpResponse.setData(payload);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	})
	.catch((err) => {
		httpResponse.setError(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};


module.exports = {
	signup,
	login,
	verify
};

