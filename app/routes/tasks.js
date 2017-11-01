const router = require('express').Router();
const controller = require('../api/tasks.controller');


router.get('/tasks/', controller.requestTasks);

router.get('/tasks/stat', controller.getStatsAll);
router.get('/tasks/stat/:agent', controller.getStatsAgent);

router.get('/tasks/client/version', controller.getClientVersion);
router.put('/tasks/client/version/:version', controller.setClientVersion);


module.exports = router;
