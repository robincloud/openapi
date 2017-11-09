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

class AgentNotFound extends Error {
	constructor(agent) {
		super(`unable to find agent name (${agent}).`);
		this.name = 'AgentNotFoundError';
		this.statusCode = 404;
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
	AgentNotFound,
	ServerError
};
