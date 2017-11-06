const AuthService = require('../services/auth');
const HttpResponse = require('../services/http-response');


const verifyJWT = (req, res, next) => {
	const token = (req.headers['x-access-token'] || req.query['access_token']);

	AuthService.verify(token)
	.then((payload) => {
		req.user = payload['email'];    // Set the email address as user
		next();
	})
	.catch((err) => {
		const httpResponse = new HttpResponse(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};


module.exports = {
	verifyJWT
};
