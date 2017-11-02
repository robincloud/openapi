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
 *         name: (JSON request)
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - passphrase
 *           properties:
 *             email:
 *               type: string
 *               description: Name of this account (Should be a valid email address)
 *               example: "someone@somedomain.com"
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
 *               example: "someone@somedomain.com"
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
 *               example: "email address (someone@somedomain.com) already exists"
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
 *         name: (JSON request)
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - passphrase
 *           properties:
 *             email:
 *               type: string
 *               description: Email address to log in
 *               example: "someone@somedomain.com"
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
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbWVvbmVAc29tZWRvbWFpbi5jb20iLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTUwOTYwODU5MCwiZXhwIjoxNTA5Njk0OTkwLCJpc3MiOiJ0aGVjb21tZXJjZS5jby5rciJ9.JaTmb0VxyPr2jfoFKzEOCUD5m6KI6c2Xkk0IYbdWAfE"
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
 *               example: "unable to find email address (someone@somedomain.com)"
 */
router.post('/auth/login', controller.login);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     description: Verifies access token (Invoking this API is usually not required)
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: access_token
 *         type: string
 *         required: true
 *         description: JSON Web Token which can be obtained by logging in
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbWVvbmVAc29tZWRvbWFpbi5jb20iLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTUwOTYwODU5MCwiZXhwIjoxNTA5Njk0OTkwLCJpc3MiOiJ0aGVjb21tZXJjZS5jby5rciJ9.JaTmb0VxyPr2jfoFKzEOCUD5m6KI6c2Xkk0IYbdWAfE"
 *     responses:
 *       200:
 *         description: JWT successfully verified
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "someone@somedomain.com"
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
