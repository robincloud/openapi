const router = require('express').Router();
const controller = require('../api/agents.controller');

/**
 * @swagger
 * /agents/test:
 *   get:
 *     description: test itself
 *     produces:
 *      - application/json
 *     parameters:
 *      - in: query
 *        name: id
 *        description: id
 *
 *     responses:
 *       200:
 *         description: result
 *
 */

router.post('/agents/enroll', controller.saveAgent);
router.post('/agents/msg', controller.saveMsg);
router.get('/agents/request', controller.getMsg);
router.get('/agents/test', controller.test);
module.exports = router;
