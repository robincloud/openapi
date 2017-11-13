const router = require('express').Router();

/**
 * @swagger
 * /:
 *   get:
 *     description: Returns RobinCloud OpenAPI default HTML page
 *
 *     responses:
 *       200:
 *          description: Success
 */
router.get('/', (req, res) => {
    const path = __dirname + '/default.html';
    res.sendFile(path);
});

/**
 * @swagger
 * /echo:
 *   get:
 *     description: Send echo
 *
 *     responses:
 *       200:
 *          description: Success
 */
router.get('/echo', (req, res) => {
	res.send('Hello RobinCloud OpenAPI!');
});

/**
 * @swagger
 * /rpi:
 *   get:
 *     description: Response echo to 'get /rpi' request for healthy check
 *
 *     responses:
 *       200:
 *          description: Success
 */
router.get('/rpi', (req, res) => {
    //res.send('RobinCloud Open API');
    const path = __dirname + '/message.html';
    res.sendFile(path);
});

router.get('/robin.png', (req, res) => {
    const path = __dirname + '/robin.png';
    res.sendFile(path);
});

router.get('/favicon.ico', (req, res) => {
    const path = __dirname + '/favicon.ico';
    res.sendFile(path);
});

module.exports = router;
