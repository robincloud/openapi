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
 *      agent:
 *          type: string
 *          description: Unique identifier of the crawling agent
 *          example: agent_01
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
 *                                example: 107203229047
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
 *   ItemPriceDescription:
 *     properties:
 *       message:
 *          type: string
 *       data:
 *          type: object
 *          properties:
 *              id:
 *                  type: string
 *              name:
 *                  type: string
 *              image:
 *                  type: string
 *              sid:
 *                  type: string
 *              options:
 *                  type: string
 *              lowest_price:
 *                  type: number
 *              lowest_price_with_delivery:
 *                  type: number
 */

/**
 * @swagger
 * definitions:
 *   ItemPriceDescription:
 *     properties:
 *       message:
 *          type: string
 *       data:
 *          type: object
 *          properties:
 *              count:
 *                  description: # of returned items
 *                  type: number
 *              items:
 *                  type: array
 *                  items:
 *                      type: object
 *                      properties:
 *                          cat:
 *                              type: string
 *                          id:
 *                              type: string
 *                          name:
 *                              type: string
 *                          sid:
 *                              type: string
 *                          image:
 *                              type: string
 *                          option:
 *                              type: string
 *                          lowest_price:
 *                              type: number
 *                          lowest_price_with_delivery:
 *                              type: number
 */

/**
 * @swagger
 * definitions:
 *   ItemDescription:
 *     properties:
 *       message:
 *          type: string
 *       data:
 *          type: object
 *          properties:
 *              count:
 *                  description: # of returned items
 *                  type: number
 *              items:
 *                  type: array
 *                  items:
 *                      type: object
 *                      properties:
 *                          cat:
 *                              type: string
 *                          vector:
 *                              type: array
 *                              items:
 *                                  type: number
 *                                  example: 1
 *                          image:
 *                              type: string
 *                          option:
 *                              type: string
 *                          malls:
 *                              type: array
 *                              items:
 *                                  description: mall's id
 *                                  type: string
 *                                  example: "nv_107203229047"
 *                          id:
 *                              type: string
 *                          name:
 *                              type: string
 *                          sid:
 *                              type: string
 */

/**
 * @swagger
 * definitions:
 *   MallDescription:
 *     properties:
 *       message:
 *          type: string
 *       data:
 *          type: object
 *          properties:
 *              count:
 *                  description: # of returned items
 *                  type: number
 *              items:
 *                  type: array
 *                  items:
 *                      type: object
 *                      properties:
 *                          mall:
 *                              type: string
 *                          npay:
 *                              type: number
 *                              description: whether it's npay(1) or not(0)
 *                              example: 1
 *                          delivery:
 *                              type: number
 *                              example: 2500
 *                          price:
 *                              type: number
 *                              example: 10000
 *                          id:
 *                              type: string
 *                          name:
 *                              type: string
 *                          sid:
 *                              type: string
 */

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

/**
 * @swagger
 * /items/query/{id}:
 *   get:
 *     description: Returns the description of an item with the information regarding lowest price
 *     produces:
 *      - application/json
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: item's id ({sid}_{pid}_{oid})
 *        type: string
 *        example: nv_5639964597_20041523
 *     security:
 *      - JWT: []
 *
 *     responses:
 *       200:
 *         description: the description of the item
 *         schema:
 *           $ref: '#/definitions/ItemPriceDescription'
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
router.get('/items/query/:id', AuthMiddleware.verifyJWT, controller.getItemPrice);

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     description: Returns an item when id is given, otherwise returns list of items
 *     produces:
 *      - application/json
 *     parameters:
 *      - in: path
 *        name: id
 *        required: false
 *        description: item's id ({sid}_{pid}_{oid})
 *        type: string
 *        example: nv_5639964597_20041523
 *     security:
 *      - JWT: []
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
router.get('/items/:id?', AuthMiddleware.verifyJWT, controller.getItem);

/**
 * @swagger
 * /malls/{id}:
 *   get:
 *     description: Returns a mall when id is given, otherwise returns list of malls
 *     produces:
 *      - application/json
 *     parameters:
 *      - in: path
 *        name: id
 *        required: false
 *        description: mall's id ({sid}_{pid})
 *        type: string
 *        example: nv_107203229047
 *     security:
 *      - JWT: []
 *
 *     responses:
 *       200:
 *         description: the description of the mall
 *         schema:
 *           $ref: '#/definitions/MallDescription'
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
router.get('/malls/:id?', AuthMiddleware.verifyJWT, controller.getMall);

router.get('/items/test', controller.test);

module.exports = router;
