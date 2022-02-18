const express = require('express');

const momentsControllers = require('../controllers/moments-controllers');

const router = express.Router();



router.get('/:mid', momentsControllers.getMomentById);

router.get('/user/:uid', momentsControllers.getMomentByUserId);

router.post('/', momentsControllers.createMoment);

module.exports = router;