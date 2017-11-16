const path = require('path');
const express = require('express');
const config = require('./config');
require('./services/polyfills');    // For some unimplemented functions on older version of Node.js


// App class - Main application entry
class App {
	static launch() {
		const app = new App();  // Create app instance

		return config.initialize()
		.then(() => Promise.all([
			app._initMiddlewares(),
			app._initRouter(),
			app._initModels(),
			app._initSwagger()
		]))
		.then(() => app._startListen())
		.then(() => app);
	}

	constructor() {
		this._app = express();
	}


	_initMiddlewares() {
		const bodyParser = require('body-parser');

		return new Promise((resolve) => {
			// Setup middlewares
			this._app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
			this._app.use(bodyParser.json({limit: '50mb'}));

			resolve();
		});
	}

	_initRouter() {
		return new Promise((resolve) => {
			// Routings
			this._app.use('/', require('./routes/basic'));
			this._app.use('/', require('./routes/auth'));
			this._app.use('/', require('./routes/items'));
			this._app.use('/', require('./routes/agents'));
			this._app.use('/', require('./routes/tasks'));

			resolve();
		});
	}

	_initModels() {
		return Promise.all([
			require('./models/item').initialize(),
			require('./models/mall').initialize(),
			require('./models/agent').initialize(),
			require('./models/setting').initialize()
		]);
	}

	_initSwagger() {
		// Swagger definition
		const swaggerDefinition = {
			info: {
				title: 'Robin OpenAPI',
				version: '1.0.1',
				description: 'Robin OpenAPI Service Specification',
			},
			host: `${config['serverUrl']}`,
			basePath: '/',
		};

		// options for the swagger docs
		const options = {
			// import swaggerDefinitions
			swaggerDefinition: swaggerDefinition,
			// path to the API docs
			apis: [path.join(__dirname,'routes/*.js')],
		};

		// initialize swagger-jsdoc
		const swaggerSpec = require('swagger-jsdoc')(options);

		// serve swagger
		this._app.get('/swagger.json', function(req, res) {
			res.setHeader('Content-Type', 'application/json');
			res.send(swaggerSpec);
		});

		// Swagger-ui routes
		this._app.use('/swagger-ui', express.static(path.join(__dirname, 'swagger-ui')));
	}

	_startListen() {
		return new Promise((resolve, reject) => {
			this._app.listen(config['port'], (err) => {
				if (err) reject(err);
				else resolve();
			});
		});
	}
}


// Launch application
App.launch()
.then(() => {
	console.log(`Starting application listening on port ${config['port']} ...`);
})
.catch((err) => {
	console.error('Unable to launch app:');
	console.error(err);
});
