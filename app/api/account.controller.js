const AccountService = require('../services/account');
const HttpResponse = require('../services/http-response');


const changePassphrase = (req, res) => {
	const email = req.user.email;
	const passphrase = (req.body.passphrase || '');

	AccountService.changePassphrase(email, passphrase)
	.then(() => {
		res.status(204);
	})
	.catch((err) => {
		const httpResponse = new HttpResponse(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};

const changeAccessLevel = (req, res) => {
	const email = req.body.email;
	const admin = req.body.admin;
	const httpResponse = new HttpResponse();

	AccountService.changeAccessLevel(email, admin)
	.then(() => {
		httpResponse.setData({admin});
		res.status(httpResponse.statusCode).json(httpResponse.body);
	})
	.catch((err) => {
		httpResponse.setError(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};

const remove = (req, res) => {
	const email = req.body.email;
	const httpResponse = new HttpResponse();

	AccountService.remove(email)
	.then(() => {
		httpResponse.setData({email});
		res.status(httpResponse.statusCode).json(httpResponse.body);
	})
	.catch((err) => {
		httpResponse.setError(err);
		res.status(httpResponse.statusCode).json(httpResponse.body);
	});
};


module.exports = {
	changePassphrase,
	changeAccessLevel,
	remove
};

