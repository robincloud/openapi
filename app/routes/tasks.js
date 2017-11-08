const router = require('express').Router();
const controller = require('../api/tasks.controller');
const AuthMiddleware = require('../middlewares/auth');


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
 *               example: "Internal Server Error"
 *             title:
 *               type: string
 *               example: "TaskManagerError"
 *             detail:
 *               type: string
 *               example: "no handler for 'consume' event"
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
 *                   description: Time that current fetching event is triggered (null if not any event is triggered yet)
 *                   example: "2017-11-01T11:46:18.477Z"
 *                 finished:
 *                   type: string
 *                   description: Time that current fetching event is done (null if it is still fetching)
 *                   example: "2017-11-01T11:46:23.513Z"
 *                 exhausted:
 *                   type: string
 *                   description: Time that items from current fetching event are all consumed (null if it is still consuming)
 *                   example: null
 *                 elapsed:
 *                   type: string
 *                   description: Elapsed time from current fetching event is started
 *                   example: "00:00:05.900"
 *             next_event:
 *               type: string
 *               description: Time of next scheduled fetching event
 *               example: "2017-11-01T12:00:00.000Z"
 *             count:
 *               type: object
 *               properties:
 *                 fetched:
 *                   type: number
 *                   description: Number of total fetched items from DB
 *                   example: 2000
 *                 consumed:
 *                   type: number
 *                   description: Number of total consumed items by agent
 *                   example: 1620
 *                 available:
 *                   type: number
 *                   description: Number of queued items currently available
 *                   example: 380
 *             throughput:
 *               type: object
 *               properties:
 *                 fetch:
 *                   type: string
 *                   description: How many items are being consumed to agent per a second
 *                   example: "397.14 processed/sec"
 *                 consume:
 *                   type: string
 *                   description: How many items are being fetched from DB per a second
 *                   example: "274.58 processed/sec"
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
 *         description: Server error occurred (probably by the connection failure to memcached server)
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "Internal Server Error"
 *             title:
 *               type: string
 *               example: "Error"
 *             detail:
 *               type: string
 *               example: "connect ECONNREFUSED 127.0.0.1:11211"
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
 *         required: true
 *         description: Client version number to replace
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
 *               example: 2
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
 *       403:
 *         description: No permission for this operation
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "Forbidden"
 *             title:
 *               type: string
 *               example: "NotPermittedError"
 *             detail:
 *               type: string
 *               example: "only admins have a permission for this operation"
 *       500:
 *         description: Server error occurred (probably by the connection failure to memcached server)
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "Internal Server Error"
 *             title:
 *               type: string
 *               example: "Error"
 *             detail:
 *               type: string
 *               example: "connect ECONNREFUSED 127.0.0.1:11211"
 */
router.post('/tasks/client/version/:version', AuthMiddleware.verifyJWT, controller.setClientVersion);


module.exports = router;
