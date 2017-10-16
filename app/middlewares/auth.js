const AuthService = require('../services/auth');


const jwtAuthMiddleware = (req, res, next) => {
	const token = (req.headers['x-access-token'] || req.query.token);

	AuthService.verify(token)
	.then((payload) => {
		req.user = payload;
		next();
	})
	.catch((err) => {
		res.status(403).json({
			message: err.message
		});
	});
};


module.exports = {
	jwtAuthMiddleware
};

