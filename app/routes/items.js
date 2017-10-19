const router = require('express').Router();
const controller = require('../api/items.controller');

/**
 * @swagger
 * definitions:
 *   Item:
 *     properties:
 *       id:
 *         type: string
 *       name:
 *         type: string
 */

/**
 * @swagger
 * /items:
 *   post:
 *     tags:
 *       - Items
 *     description: Create a new item
 *     produces:
 *       - application/json
 *     parameters:
 *
 *     responses:
 *       200:
 *         description: Successfully created
 */
router.post('/items', controller.save);
router.get('/items/test', controller.test);

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     tags:
 *       - Items
 *     description: Returns a single item
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: item's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A single item
 *         schema:
 *           $ref: '#/definitions/Item'
 */
router.get('/items/:id', controller.query);


module.exports = router;
