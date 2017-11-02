const router = require('express').Router();
const controller = require('../api/account.controller');
const AuthMiddleware = require('../middlewares/auth');


/**
 * @swagger
 * /account/change/passphrase:
 *   post:
 *     description: Change passphrase of an account (Login required)
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         type: string
 *         required: true
 *         description: JSON Web Token which can be obtained by logging in
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbWVvbmVAc29tZWRvbWFpbi5jb20iLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTUwOTYwODU5MCwiZXhwIjoxNTA5Njk0OTkwLCJpc3MiOiJ0aGVjb21tZXJjZS5jby5rciJ9.JaTmb0VxyPr2jfoFKzEOCUD5m6KI6c2Xkk0IYbdWAfE"
 *       - in: body
 *         name: (JSON request)
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - passphrase
 *           properties:
 *             passphrase:
 *               type: string
 *               description: New passphrase to change
 *               example: "newpassword"
 *     responses:
 *       200:
 *         description: Passphrase has been modified successfully
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
router.post('/account/change/passphrase', AuthMiddleware.isLoggedIn, controller.changePassphrase);

/**
 * @swagger
 * /account/change/admin:
 *   post:
 *     description: Changes the access level of an account (Only admin users have a permission)
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         type: string
 *         required: true
 *         description: JSON Web Token which can be obtained by logging in
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbWVvbmVAc29tZWRvbWFpbi5jb20iLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTUwOTYwODU5MCwiZXhwIjoxNTA5Njk0OTkwLCJpc3MiOiJ0aGVjb21tZXJjZS5jby5rciJ9.JaTmb0VxyPr2jfoFKzEOCUD5m6KI6c2Xkk0IYbdWAfE"
 *       - in: body
 *         name: (JSON request)
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - admin
 *           properties:
 *             email:
 *               type: string
 *               description: Account to change access level
 *               example: "someone@somedomain.com"
 *             admin:
 *               type: boolean
 *               description: Whether admin access is granted to the account
 *               example: true
 *     responses:
 *       200:
 *         description: Admin access has been modified successfully
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
router.post('/account/change/admin', AuthMiddleware.isAdmin, controller.changeAccessLevel);

/**
 * @swagger
 * /account:
 *   delete:
 *     description: Delete an account (Only admin users have a permission)
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-access-token
 *         type: string
 *         required: true
 *         description: JSON Web Token which can be obtained by logging in
 *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbWVvbmVAc29tZWRvbWFpbi5jb20iLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTUwOTYwODU5MCwiZXhwIjoxNTA5Njk0OTkwLCJpc3MiOiJ0aGVjb21tZXJjZS5jby5rciJ9.JaTmb0VxyPr2jfoFKzEOCUD5m6KI6c2Xkk0IYbdWAfE"
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
 *               description: Account to delete
 *               example: "someone@somedomain.com"
 *     responses:
 *       200:
 *         description: Given account has been deleted successfully
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
router.delete('/account', AuthMiddleware.isAdmin, controller.remove);


module.exports = router;
