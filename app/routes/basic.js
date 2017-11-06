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


module.exports = router;
