const router = require('express').Router();
const controller = require('../api/auth.controller');


router.post('/auth/signup', controller.signup);
router.post('/auth/login', controller.login);
router.get('/auth/verify', controller.verify);


module.exports = router;

