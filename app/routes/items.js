const router = require('express').Router();
const controller = require('../api/items.controller');

/**
 * @swagger
 * definitions:
 *   ItemMall:
 *     properties:
 *      time:
 *          type: string
 *      url:
 *          type: string
 *      api:
 *          type: string
 *      data:
 *          type: array
 *          items:
 *              type: object
 *              properties:
 *                id:
 *                    type: number
 *                mid:
 *                    type: number
 *                cat_id:
 *                    type: number
 *                pkey:
 *                    type: number
 *                name:
 *                    type: string
 *                nodes:
 *                    type: array
 *                    items:
 *                        type: object
 *                        properties:
 *                            id:
 *                                type: number
 *                            name:
 *                                type: string
 *                            mall:
 *                                type: string
 *                            price:
 *                                type: number
 *                            delivery:
 *                                type: number
 *                            npay:
 *                                type: number
 *
 */

/**
 * @swagger
 * definitions:
 *   Item:
 *     properties:
 *       mall_name:
 *          type: string
 *       id:
 *          type: number
 *       pkey:
 *          type: number
 *       mid:
 *          type: number
 *       name:
 *          type: string
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

/**
 * @swagger
 * /items/malls:
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
router.post('/items/malls', controller.saveMall);

/**
 * @swagger
 * /items:
 *  post:
 *      description: Store a new item
 *      produces:
 *          - application/json
 *      consumes:
 *          - application/json
 *      parameters:
 *          - in: body
 *            name: item_detail
 *            description: items to be added
 *            schema:
 *              $ref: '#/definitions/Item'
 *
 *      responses:
 *          200:
 *              description: Successfully created
 */
router.post('/items/', controller.saveItem);
router.get('/items/test', controller.test);

/**
 * @swagger
 * /items:
 *   get:
 *     description: Returns a single item
 *     produces:
 *      - application/json
 *     parameters:
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
 */
router.get('/items', controller.query);


module.exports = router;
