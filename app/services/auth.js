const jwt = require('jsonwebtoken');
const Config = require('../config');
const CustomError = require('./custom-error');


class AuthService {
	static issue(email) {
		return new Promise((resolve, reject) => {
			if (!AuthService._isValidEmailAddress(email)) {
				return reject(new CustomError.InvalidArgument(`invalid email address (${email})`));
			}

			const payload = {email};
			const secret = Config['jwtSecret'];
			const options = {
				expiresIn: AuthService._getMaxAge(),    // Set token expiration
				issuer: AuthService._getIssuer()        // Set token issuer
			};

			jwt.sign(payload, secret, options, (err, token) => {
				if (err) {
					reject(new CustomError.Unauthorized(err.message, err.name));
				} else {
					resolve(token);
				}
			});
		});
	}

	static verify(token) {
		return new Promise((resolve, reject) => {
			if (!token) {
				return reject(new CustomError.Unauthorized('empty access token'));
			}

			const secret = Config['jwtSecret'];
			const options = {
				issuer: AuthService._getIssuer(),   // Verify token issuer
				maxAge: AuthService._getMaxAge()    // Verify token expiration
			};

			jwt.verify(token, secret, options, (err, payload) => {
				if (err) {
					reject(new CustomError.Unauthorized(err.message, err.name));
				} else {
					resolve(payload);
				}
			});
		});
	}


	// Private methods
	static _isValidEmailAddress(email) {
		const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return emailRegex.test(email);
	}

	static _getMaxAge() {
		return '30d';   // Token expires in 30 days
	}

	static _getIssuer() {
		return 'thecommerce.co.kr';
	}


	// FOR TEST
	static test() {
		const email = 'mankiplayer@hotmail.com';

		AuthService.issue(email)
		.then((token) => {
			console.log('* Issued token:');
			console.log(token);
			return AuthService.verify(token);
		})
		.then((payload) => {
			console.log('* Restored payload:');
			console.log(payload);
			console.log('PASSED.');
		})
		.catch((err) => {
			console.error(err);
		});
	}
}


module.exports = AuthService;
