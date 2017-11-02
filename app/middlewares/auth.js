const AuthService = require('../services/auth');
const HttpResponse = require('../services/http-response');


const _authMiddleware = (req, res, next, checkAdmin) => {
	const token = (req.headers['x-access-token'] || req.query.token);

	AuthService.verify(token, checkAdmin)
	.then((payload) => {
		req.user = payload;
		next();
	})
	.catch((err) => {
		const httpResponse = new HttpResponse(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};


const isLoggedIn = (req, res, next) => {
	_authMiddleware(req, res, next, false);
};


const isAdmin = (req, res, next) => {
	_authMiddleware(req, res, next, true);
};


module.exports = {
	isLoggedIn,
	isAdmin
};

