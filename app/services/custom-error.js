class InvalidArgument extends Error {
	constructor(message) {
		super(message);
		this.name = 'InvalidArgumentError';
		this.statusCode = 400;
	}
}

class Unauthorized extends Error {
	constructor(message, name = '') {
		super(message);
		this.name = (name || 'UnauthorizedError');
		this.statusCode = 401;
	}
}

class NotPermitted extends Error {
	constructor(message, name = '') {
		super(message);
		this.name = (name || 'NotPermittedError');
		this.statusCode = 403;
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
	Unauthorized,
	NotPermitted,
	UserNotFound,
	UserExists,
	ServerError
};
