const router = require('express').Router();
const controller = require('./items.controller');

router.post('/', controller.save);
router.get('/query/:id', controller.query);
router.get('/test', controller.test);

module.exports = router;
