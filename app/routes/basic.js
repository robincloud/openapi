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
    res.send('RobinCloud Open API');
});


module.exports = router;
