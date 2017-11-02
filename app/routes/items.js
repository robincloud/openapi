const router = require('express').Router();
const controller = require('../api/items.controller');
const AuthMiddleware = require('../middlewares/auth');


/**
 * @swagger
 * definitions:
 *   ItemMall:
 *     description: server info
 *     properties:
 *      time:
 *          type: string
 *          example: 2017-08-08 11:08:44
 *      url:
 *          type: string
 *      api:
 *          type: string
 *      id:
 *          type: string
 *          description: id from server
 *          example: nv_5639964597
 *      mid:
 *          type: string
 *          description: target mid of nshop
 *          example: 5639964597
 *      data:
 *          type: array
 *          description: client crawling response
 *          items:
 *              type: object
 *              properties:
 *                cat:
 *                    type: string
 *                    description: category name ( delimiter < )
 *                    example: 'food>ramen'
 *                item_name:
 *                    type: string
 *                    description: item name
 *                    example: shin ramen 120g
 *                option_name:
 *                    type: string
 *                    description: option name
 *                pkey:
 *                    type: number
 *                    description: option id (or key)
 *                    example: 20041523
 *                count:
 *                    type: number
 *                    description: max search count
 *                    example: 1328
 *                nodes:
 *                    type: array
 *                    description: list of malls found
 *                    items:
 *                        type: object
 *                        properties:
 *                            id:
 *                                type: number
 *                                example: 11900885999
 *                            name:
 *                                type: string
 *                                example: shin ramen 120g / best
 *                            mall:
 *                                type: string
 *                                example: food online mall
 *                            thumbnail:
 *                                type: string
 *                                description: thumbnail url
 *                            price:
 *                                type: number
 *                                example: 10000
 *                            delivery:
 *                                type: number
 *                                example: 2500
 *                            npay:
 *                                type: number
 *                                description: whether it's npay(1) or not(0)
 *                                example: 1
 *                meta:
 *                    type: object
 *                    description: additional meta information
 *                    properties:
 *                      cat:
 *                          type: string
 *                      thumbnail:
 *                          type: string
 *
 */

/**
 * @swagger
 * definitions:
 *   ItemDescription:
 *     properties:
 *       id:
 *         type: string
 *       name:
 *         type: string
 *       price:
 *         type: number
 */

router.get('/items/test', controller.test);

/**
 * @swagger
 * /items:
 *   get:
 *     description: Returns a single item
 *     produces:
 *      - application/json
 *     parameters:
 *      - in: header
 *        name: x-access-token
 *        type: string
 *        required: true
 *        description: JSON Web Token which can be obtained by logging in
 *        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbWVvbmVAc29tZWRvbWFpbi5jb20iLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTUwOTYwODU5MCwiZXhwIjoxNTA5Njk0OTkwLCJpc3MiOiJ0aGVjb21tZXJjZS5jby5rciJ9.JaTmb0VxyPr2jfoFKzEOCUD5m6KI6c2Xkk0IYbdWAfE"
 *      - in: query
 *        name: mall_name
 *        description: item's mall name
 *        required: true
 *        type: string
 *        example: nv
 *      - in: query
 *        name: mall_id
 *        description: item's mall id
 *        required: true
 *        type: number
 *        example: 1111111111
 *      - in: query
 *        name: pkey
 *        description: item's option id
 *        required: false
 *        type: number
 *        example: 111
 *
 *     responses:
 *       200:
 *         description: the description of the item
 *         schema:
 *           $ref: '#/definitions/ItemDescription'
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
router.get('/items', AuthMiddleware.isLoggedIn, controller.query);

/**
 * @swagger
 * /items:
 *  post:
 *      description: Store the data crawled from the mall
 *      produces:
 *          - application/json
 *      consumes:
 *          - application/json
 *      parameters:
 *          - in: body
 *            name: item_detail
 *            schema:
 *              $ref: '#/definitions/ItemMall'
 *
 *      responses:
 *          200:
 *              description: Successfully created
 */
router.post('/items', controller.saveItem);


module.exports = router;
