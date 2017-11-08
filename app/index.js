const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');


// App instance
const app = express();

// Swagger definition
const swaggerDefinition = {
    info: {
        title: 'RobinCloud Open API',
        version: '1.0.0',
        description: 'Open API server API specification',
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
const swaggerSpec = swaggerJSDoc(options);

// Setting middlewares
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

// Routings
app.use('/', require('./routes/basic'));
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/items'));
app.use('/', require('./routes/agents'));
app.use('/', require('./routes/tasks'));

// serve swagger
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Swagger-ui routes
app.use('/swagger-ui', express.static(path.join(__dirname, 'swagger-ui')));

// favicon image.
app.get('/favicon.ico', function(req, res) {
    res.setHeader('Content-Type', 'image/x-icon');
    res.sendFile(path.join(__dirname, 'favicon.ico'));
});


// Launching application after models are initialized
Promise.all([
	require('./models/item').initialize(),
	require('./models/mall').initialize(),
    require('./models/agent').initialize()
])
.then(() => {
	const listener = app.listen(config['port'], () => {
		console.log(`Starting application listening on port ${listener.address().port} ...`);
	})
})
.catch((err) => {
	console.error(`Failed to initialize DynamoDB models: ${err.message}`);
});

