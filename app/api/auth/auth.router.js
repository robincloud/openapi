const router = require('express').Router();
const controller = require('./auth.controller');


router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.get('/verify', controller.verify);


module.exports = router;

