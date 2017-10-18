const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');


// App instance
const app = express();

// Setting middlewares
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

// Routings
app.use('/auth', require('./api/auth/auth.router'));
app.use('/items', require('./api/items/items.router'));

// Response echo to 'GET /' request for healthy check
app.get('/', (req, res) => {
	res.send('RobinCloud Open API');
});


// Launching application
const listener = app.listen(config['port'], () => {
    console.log(`Starting application listening on port ${listener.address().port} ...`);
});

