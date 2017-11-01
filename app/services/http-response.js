const HTTP_STATUS_CODE = {
	// 1xx Informational responses
	100: "Continue",
	101: "Switching Protocols",
	102: "Processing",

	// 2xx Success
	200: "OK",
	201: "Created",
	202: "Accepted",
	203: "Non-Authoritative Information",
	204: "No Content",
	205: "Reset Content",
	206: "Partial Content",
	207: "Multi-Status",
	208: "Already Reported",
	226: "IM Used",

	// 3xx Redirection
	300: "Multiple Choices",
	301: "Moved Permanently",
	302: "Found",
	303: "See Others",
	304: "Not Modified",
	305: "Use Proxy",
	306: "Switch Proxy",
	307: "Temporary Redirect",
	308: "Permanent Redirect",

	// 4xx Client errors
	400: "Bad Request",
	401: "Unauthorized",
	402: "Payment Required",
	403: "Forbidden",
	404: "Not Found",
	405: "Method Not Allowed",
	406: "Not Acceptable",
	407: "Proxy Authentication Required",
	408: "Request Timeout",
	409: "Confilct",
	410: "Gone",
	411: "Length Required",
	412: "Precondition Failed",
	413: "Payload Too Large",
	414: "URI Too Long",
	415: "Unsupported Media Type",
	416: "Range Not Satisfiable",
	417: "Expectation Failed",
	418: "I'm a teapot",
	421: "Misdirected Request",
	422: "Unprocessable Entity",
	423: "Locked",
	424: "Failed Dependency",
	426: "Upgrade Required",
	428: "Precondition Required",
	429: "Too Many Requests",
	431: "Request Header Fields Too Large",
	451: "Unavailable For Legal Reasons",

	// 5xx Server errors
	500: "Internal Server Error",
	501: "Not Implemented",
	502: "Bad Gateway",
	503: "Service Unavailable",
	504: "Gateway Timeout",
	505: "HTTP Version Not Supported",
	506: "Variant Also Negotiates",
	507: "Insufficient Storage",
	508: "Loop Detected",
	510: "Not Extended",
	511: "Network Authentication Required"
};


// Class HttpResponse
class HttpResponse {
	constructor(err = null, data = null) {
		if (err) {
			if (!(err instanceof Error)) {
				throw new Error('Error parameter must be the instance of Error object.');
			}
			this.setError(err);
		} else {
			this.setData(data);
		}
	}

	get statusCode()    { return this._statusCode; }
	get body()          { return this._body; }

	setData(data) {
		this._statusCode = 200;
		this._body = data;
	}

	setError(err) {
		if (err && !(err instanceof Error)) {
			throw new Error('Error parameter must be the instance of Error object.');
		}

		this._statusCode = err.statusCode;
		this._body = {
			status: (HTTP_STATUS_CODE[err.statusCode] || 'Unknown status code'),
			title: (err.name || ''),
			detail: (err.message || '')
		};
	}
}


module.exports = HttpResponse;
