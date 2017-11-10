const router = require('express').Router();
const controller = require('../api/tasks.controller');
const AuthMiddleware = require('../middlewares/auth');


/**
 * @swagger
 * /tasks/force-trigger:
 *   post:
 *     description: Force triggers scanning items from DB ignoring reserved schedule
 *     produces:
 *       - application/json
 *     security:
 *       - JWT: []
 *     responses:
 *       200:
 *         description: Scanning is has been started successfully
 *         schema:
 *           type: object
 *           properties:
 *             current_event:
 *               type: string
 *               description: Time of current event triggered
 *               example: "2017-11-08T07:32:11.017Z"
 *             next_event:
 *               type: string
 *               description: Time of next scheduled event
 *               example: "2017-11-08T09:00:00.000Z"
 *       500:
 *         description: Server error occurred
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *             title:
 *               type: string
 *             detail:
 *               type: string
 */
router.post('/tasks/force-trigger', AuthMiddleware.verifyJWT, controller.forceTrigger);

/**
 * @swagger
 * /tasks:
 *   get:
 *     description: Requests some tasks for collecting item information of given mid
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: agent
 *         type: string
 *         required: true
 *         description: Unique identifier of the crawling agent
 *         example: agent_01
 *       - in: query
 *         name: size
 *         type: number
 *         required: false
 *         description: Maximum number of tasks to request (default value is 1)
 *         example: 1
 *     responses:
 *       200:
 *         description: Tasks are successfully assigned
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Task identifier
 *                 example: "agent_01"
 *               mid:
 *                 type: number
 *                 description: Naver mid
 *                 example: 1203970239
 *       400:
 *         description: Agent parameter is missing
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "Bad Request"
 *             title:
 *               type: string
 *               example: "InvalidArgumentError"
 *             detail:
 *               type: string
 *               example: "missing required parameter (agent)"
 *       500:
 *         description: Server error occurred
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *             title:
 *               type: string
 *             detail:
 *               type: string
 */
router.get('/tasks', controller.getTasks);

/**
 * @swagger
 * /tasks/stat/{agent}:
 *   get:
 *     description: Obtains task management statistics (Login required)
 *     produces:
 *       - applications/json
 *     parameters:
 *       - in: path
 *         name: agent
 *         type: string
 *         required: false
 *         description: Unique identifier of the crawling agent
 *         example: "agent_01"
 *     security:
 *       - JWT: []
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               description: \'running\' if items are being fetched from DB or there are available items in queue otherwise \'idle\'
 *               example: running
 *             current_event:
 *               type: object
 *               properties:
 *                 started:
 *                   type: string
 *                   description: Time that current event is triggered (null if not any event is triggered yet)
 *                   example: "2017-11-01T11:46:18.477Z"
 *                 finished_scan:
 *                   type: string
 *                   description: Time that scanning items (from DB) event is done (null if it is still scanning)
 *                   example: "2017-11-01T11:46:23.513Z"
 *                 finished_fetch:
 *                   type: string
 *                   description: Time that scanned items are all fetched by agents (null if it is still consuming)
 *                   example: null
 *                 finished_process:
 *                   type: string
 *                   description: Time that all items are processed and returned by agents (null if it is still processing)
 *                 elapsed:
 *                   type: string
 *                   description: Elapsed time from current event is started
 *                   example: "00:00:05.900"
 *             next_event:
 *               type: string
 *               description: Time of next scheduled event
 *               example: "2017-11-01T12:00:00.000Z"
 *             counts:
 *               type: object
 *               properties:
 *                 scanned:
 *                   type: number
 *                   description: Number of total scanned items from DB
 *                 fetched:
 *                   type: number
 *                   description: Number of total fetched items by agents
 *                   example: 2000
 *                 processed:
 *                   type: number
 *                   description: Number of total processed items by agents
 *                   example: 1620
 *                 timeout:
 *                   type: number
 *                   description: Number of total timed out items
 *                   example: 12
 *             throughput:
 *               type: object
 *               properties:
 *                 scan:
 *                   type: string
 *                   description: How many items are being scanned from DB per a second
 *                   example: "397.14 items/sec"
 *                 process:
 *                   type: string
 *                   description: How many items are being processed by agents per a second
 *                   example: "274.58 items/sec"
 *       401:
 *         description: Unauthorized access with invalid access token
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "Unauthorized"
 *             title:
 *               type: string
 *               example: "JsonWebTokenError"
 *             detail:
 *               type: string
 *               example: "empty or wrong x-access-token header"
 */
router.get('/tasks/stat/(:agent)?', AuthMiddleware.verifyJWT, controller.getStats);

/**
 * @swagger
 * /tasks/client/version:
 *   get:
 *     description: Obtains the client version
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: object
 *           properties:
 *             clientVersion:
 *               type: number
 *               description: Current client version number
 *               example: 1
 *       500:
 *         description: Server error occurred
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *             title:
 *               type: string
 *             detail:
 *               type: string
 */
router.get('/tasks/client/version', controller.getClientVersion);

/**
 * @swagger
 * /tasks/client/version/{clientVersion}:
 *   post:
 *     description: Changes the client version (Login required)
 *     produces:
 *       -application/json
 *     parameters:
 *       - in: path
 *         name: clientVersion
 *         type: number
 *         required: false
 *         description: Client version number to replace. Current version is incremented by 1 if this value is not set
 *         example: 1
 *     security:
 *       - JWT: []
 *     responses:
 *       200:
 *         description: Client version number has been successfully changed
 *         schema:
 *           type: object
 *           properties:
 *             clientVersion:
 *               type: number
 *               example: 1
 *       401:
 *         description: Unauthorized access with invalid access token
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "Unauthorized"
 *             title:
 *               type: string
 *               example: "JsonWebTokenError"
 *             detail:
 *               type: string
 *               example: "empty or wrong x-access-token header"
 *       500:
 *         description: Server error occurred
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *             title:
 *               type: string
 *             detail:
 *               type: string
 */
router.post('/tasks/client/version/:version?', AuthMiddleware.verifyJWT, controller.setClientVersion);


module.exports = router;
