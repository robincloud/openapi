const AuthService = require('../services/auth');


const signup = (req, res) => {
	const {email, passphrase} = req.body;

	AuthService.signup(email, passphrase)
	.then((user) => {
		res.json({
			message: 'A new user is registered successfully.',
			user
		});
	})
	.catch((err) => {
		res.status(400).json({
			message: err.message
		});
	});
};


const login = (req, res) => {
	const {email, passphrase} = req.body;

	AuthService.login(email, passphrase)
	.then((token) => {
		res.json({
			message: 'Login done.',
			access_token: token
		});
	})
	.catch((err) => {
		res.status(403).json({
			message: err.message
		});
	});
};


const verify = (req, res) => {
	const token = (req.headers['x-access-token'] || req.query.access_token);

	AuthService.verify(token)
	.then((payload) => {
		res.json({
			payload
		});
	})
	.catch((err) => {
		res.status(403).json({
			message: err.message
		});
	});
};


module.exports = {
	signup,
	login,
	verify
};

