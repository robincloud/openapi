const router = require('express').Router();
const controller = require('../api/auth.controller');


/**
 * @swagger
 * securityDefinitions:
 *   JWT:
 *     type: apiKey
 *     description: JWT based authentication
 *     name: x-access-token
 *     in: header
 */

/**
 * @swagger
 * /auth/issue:
 *   post:
 *     description: Issues an access token and sends it to the given email address
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: (JSON request)
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *           properties:
 *             email:
 *               type: string
 *               description: Name of this account (Should be a valid email address)
 *               example: "someone@somedomain.com"
 *     responses:
 *       200:
 *         description: Authentication email is successfully sent
 *         schema:
 *           type: object
 *           properties:
 *             ResponseMetadata:
 *                 type: object
 *                 properties:
 *                   RequestId:
 *                     type: string
 *             MessageId:
 *               type: string
 *       400:
 *         description: Email address is not valid
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
 *               example: "invalid email address (...)"
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
router.post('/auth/issue', controller.issueToken);


module.exports = router;
