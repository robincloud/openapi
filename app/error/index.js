class InvalidArgument extends Error {
	constructor(message) {
		super(message);
		this.name = 'Invalid argument';
		this.statusCode = 400;
	}
}

class AuthenticationFailed extends Error {
	constructor(message) {
		super(message);
		this.name = 'Authentication failed';
		this.statusCode = 401;
	}
}

class UserNotFound extends Error {
	constructor(email) {
		super(`Unable to find the email address (${email}).`);
		this.name = 'User not found';
		this.statusCode = 404;
	}
}

class UserExists extends Error {
	constructor(email) {
		super(`Given email address (${email}) is already registered.`);
		this.name = 'User exists';
		this.statusCode = 409;
	}
}


module.exports = {
	InvalidArgument,
	AuthenticationFailed,
	UserNotFound,
	UserExists
};
