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
    host: 'localhost:8090',
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

// Response echo to 'GET /' request for healthy check
app.get('/', (req, res) => {
    res.send('RobinCloud Open API');
});

// Routings
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/items'));

// serve swagger
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Swagger-ui routes
app.use('/swagger-ui', express.static(path.join(__dirname, 'swagger-ui')));


// Launching application
const listener = app.listen(config['port'], () => {
    console.log(`Starting application listening on port ${listener.address().port} ...`);
});

