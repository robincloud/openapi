const router = require('express').Router();
const controller = require('../api/auth.controller');


/**
 * @swagger
 * /auth/signup:
 *   post:
 *     description: Creates a new account
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: account
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - passphrase
 *           properties:
 *             email:
 *               type: string
 *               description: Name of this account (Should be a valid email address)
 *               example: "new_account@somedomain.com"
 *             passphrase:
 *               type: string
 *               description: Passphrase for this account
 *               example: "mypassword"
 *     responses:
 *       201:
 *         description: New account is successfully created
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "new_account@somedomain.com"
 *             passphrase:
 *               type: string
 *               example: "iElFc3iL/VybmgLZeOPauq9Lot0="
 *             admin:
 *               type: boolean
 *               description: Whether the account has a root privilege
 *               example: false
 *       400:
 *         description: One of the required parameters is missing
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
 *               example: "empty email address"
 *       409:
 *         description: Given email address had already been registered
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "Conflict"
 *             title:
 *               type: string
 *               example: "UserExistsError"
 *             detail:
 *               type: string
 *               example: "email address (new_account@somedomain.com) already exists"
 */
router.post('/auth/signup', controller.signup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     description: Attempts to log in
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: account
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - passphrase
 *           properties:
 *             email:
 *               type: string
 *               description: Email address to log in
 *               example: "new_account@somedomain.com"
 *             passphrase:
 *               type: string
 *               description: Passphrase for this account
 *               example: "mypassword"
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         schema:
 *           type: object
 *           properties:
 *             access_token:
 *               type: string
 *               description: JSON Web Token used for authentication of further operations
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5ld19hY2NvdW50QHNvbWVkb21haW4uY29tIiwiYWRtaW4iOmZhbHNlLCJpYXQiOjE1MDk1MjU2NzAsImV4cCI6MTUwOTYxMjA3MCwiaXNzIjoidGhlY29tbWVyY2UuY28ua3IifQ.O7yR4Tr26737xM3rp-ko5E-xhxhAzKQAsGP-cJN2190"
 *       401:
 *         description: Log in failed
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "Unauthorized"
 *             title:
 *               type: string
 *               example: "AuthenticationFailedError"
 *             detail:
 *               type: string
 *               example: "wrong passphrase"
 *       404:
 *         description: Unable to find the user
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "Not Found"
 *             title:
 *               type: string
 *               example: "UserNotFoundError"
 *             detail:
 *               type: string
 *               example: "unable to find email address (new_account@somedomain.com)"
 */
router.post('/auth/login', controller.login);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     description: Verifies access token
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: access_token
 *         type: string
 *         required: true
 *         description: JSON Web Token which can be obtained by logging in
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5ld19hY2NvdW50QHNvbWVkb21haW4uY29tIiwiYWRtaW4iOmZhbHNlLCJpYXQiOjE1MDk1MjU2NzAsImV4cCI6MTUwOTYxMjA3MCwiaXNzIjoidGhlY29tbWVyY2UuY28ua3IifQ.O7yR4Tr26737xM3rp-ko5E-xhxhAzKQAsGP-cJN2190"
 *     responses:
 *       200:
 *         description: JWT successfully verified
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "new_account@somedomain.com"
 *             admin:
 *               type: boolean
 *               example: false
 *             iat:
 *               type: number
 *               example: 1509519929
 *             exp:
 *               type: number
 *               example: 1509606329
 *             iss:
 *               type: string
 *               example: "thecommerce.co.kr"
 *       400:
 *         description: Empty JWT
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
 *               example: "empty token"
 *       401:
 *         description: JWT verification failed
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
 *               example: "invalid token"
 */
router.get('/auth/verify', controller.verify);


module.exports = router;
