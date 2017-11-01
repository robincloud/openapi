class InvalidArgument extends Error {
	constructor(message) {
		super(message);
		this.name = 'InvalidArgumentError';
		this.statusCode = 400;
	}
}

class AuthenticationFailed extends Error {
	constructor(message, name = '') {
		super(message);
		this.name = (name || 'AuthenticationFailedError');
		this.statusCode = 401;
	}
}

class UserNotFound extends Error {
	constructor(email) {
		super(`unable to find email address (${email}).`);
		this.name = 'UserNotFoundError';
		this.statusCode = 404;
	}
}

class UserExists extends Error {
	constructor(email) {
		super(`email address (${email}) already exists`);
		this.name = 'UserExistsError';
		this.statusCode = 409;
	}
}

class ServerError extends Error {
	constructor(message, name = '') {
		super(message);
		this.name = (name || 'InternalServerError');
		this.statusCode = 500;
	}
}


module.exports = {
	InvalidArgument,
	AuthenticationFailed,
	UserNotFound,
	UserExists,
	ServerError
};
