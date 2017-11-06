const jwt = require('jsonwebtoken');
const Config = require('../config');
const CustomError = require('./custom-error');


class AuthService {
	static issue(email) {
		// Generate and respond the token if sign in succeeded.
		const payload = {email};
		const secret = Config['jwtSecret'];
		const options = {
			expiresIn: AuthService._getMaxAge(),    // Set token expiration
			issuer: AuthService._getIssuer()        // Set token issuer
		};

		return new Promise((resolve, reject) => {
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
				return reject(new CustomError.InvalidArgument('empty token'));
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
