const router = require('express').Router();

/**
 * @swagger
 * /:
 *   get:
 *     description: Response echo to 'get /' request for healthy check
 *
 *     responses:
 *       200:
 *          description: Success
 */
router.get('/', (req, res) => {
    //res.send('RobinCloud Open API');
    const path = __dirname + '/default.html';
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
