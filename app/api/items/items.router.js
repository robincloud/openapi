const router = require('express').Router();
const controller = require('./items.controller');

router.post('/', controller.save);
router.get('/test', controller.test);
router.get('/:id', controller.query);

module.exports = router;
