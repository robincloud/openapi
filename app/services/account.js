const CustomError = require('./custom-error');
const User = require('../models/user');


class AccountService {
	static changePassphrase(email, passphrase) {
		return User.findByEmail(email)
		.then((user) => {
			if (!user) {
				throw new CustomError.UserNotFound(email);
			}

			const secret = Config['jwtSecret'];
			const encrypted_passphrase =
				crypto.createHmac('sha1', secret)
				.update(passphrase)
				.digest('base64');

			user.set('passphrase', encrypted_passphrase);
			return user.save();
		});
	}

	static changeAccessLevel(email, admin) {
		return User.findByEmail(email)
		.then((user) => {
			if (!user) {
				throw new CustomError.UserNotFound(email);
			}

			user.set('admin', admin);
			return user.save();
		});
	}

	static remove(email) {
		return User.remove(email);
	}
}


module.exports = AccountService;
