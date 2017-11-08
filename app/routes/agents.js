const router = require('express').Router();
const controller = require('../api/agents.controller');


/**
 * @swagger
 * definitions:
 *   Agent:
 *     description: Sending Data
 *     properties:
 *      uuid:
 *          type: string
 *          example: 123719791038609
 *      name:
 *          type: string
 *          example: Crawler_00
 *
 *   Message:
 *      description: Sending Data
 *      properties:
 *         uuid:
 *            type: string
 *            example: 123719791038609
 *         name:
 *            type: string
 *            example: Crawler_00
 *         cpu:
 *            type: string
 *            description: Current usage of cpu usage
 *            example: "50"
 *         msg:
 *            type: array
 *            description: Message which sent from each individual RPI
 *            example: ["--- start 4564475---", " Finish!", "--- 1.0477879047393799 seconds ---", "--- Sleeping For 9 Sec ---"]
 */


/**
 * @swagger
 * /agents/request:
 *   get:
 *     description: Get message which delivered by RPI
 *     produces:
 *      - application/json
 *
 *     responses:
 *       200:
 *        description: Messages are successfully sent
 *        properties:
 *           message:
 *                type: array
 *                items:
 *                  properties:
 *                     uuid:
 *                       type: string
 *                       description: RPI identifier
 *                       example: "123719791038609"
 *                     name:
 *                       type: string
 *                       description: RPI Host name
 *                       example: "Crawler_00"
 *                     cpu:
 *                       type: string
 *                       description: Current usage of cpu usage
 *                       example: "50"
 *                     msg:
 *                       type: array
 *                       description: Message which sent from each individual RPI
 *                       example: ["--- start 4564475---", " Finish!", "--- 1.0477879047393799 seconds ---", "--- Sleeping For 9 Sec ---"]
 */
router.get('/agents/request', controller.getMsg);

/**
 * @swagger
 * /agents/enroll:
 *   post:
 *     description: Register new RPI
 *     produces:
 *      - application/json
 *     parameters:
 *       - in: body
 *         name: Agent_detail
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Agent'
 *     responses:
 *       200:
 *        description: Register successfully
 *        properties:
 *           type: object
 *           uuid:
 *              type: string
 *              description: RPI identifier
 *              example: "123719791038609"
 *           name:
 *              type: string
 *              description: RPI Host name
 *              example: "Crawler_00"
 *           cpu:
 *              type: string
 *              description: Current usage of cpu usage
 *              example: "50"
 *           msg:
 *              type: array
 *              description: Message which sent from each individual RPI
 *              example: ["--- start 4564475---", " Finish!", "--- 1.0477879047393799 seconds ---", "--- Sleeping For 9 Sec ---"]
 */
router.post('/agents/enroll', controller.saveAgent);



/**
 * @swagger
 * /agents/msg:
 *   post:
 *     description: Send message to Server
 *     produces:
 *      - application/json
 *     parameters:
 *       - in: body
 *         name: agent_message
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Message'
 *     responses:
 *       200:
 *        description: Messages are successfully stored
 *        properties:
 *           type: object
 *           message:
 *              type: string
 *              description: Result
 *              example: "Message saved"
 *           item:
 *              description: Updated info
 *              type: object
 *              properties:
 *                 cpu:
 *                      type: string
 *                      description: Current usage of cpu usage
 *                      example: "50"
 *                 msg:
 *                      type: array
 *                      description: Message which sent from each individual RPI
 *                      example: ["--- start 4564475---", " Finish!", "--- 1.0477879047393799 seconds ---", "--- Sleeping For 9 Sec ---"]
 *       400:
 *        description: The agent is not registered
 *        properties:
 *           type: object
 *           message:
 *              type: string
 *              description: Result
 *              example: "Given id does not exists."
 */
router.post('/agents/msg', controller.saveMsg);

router.get('/agents/test', controller.test);
module.exports = router;
