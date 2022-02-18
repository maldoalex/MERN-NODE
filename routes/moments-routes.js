const express = require('express');

const momentsControllers = require('../controllers/moments-controllers');

const router = express.Router();



router.get('/:mid', momentsControllers.getMomentById);

router.get('/user/:uid', momentsControllers.getMomentsByUserId);

router.post('/', momentsControllers.createMoment);

router.patch('/:mid', momentsControllers.updateMoment);

router.delete('/:mid', momentsControllers.deleteMoment);

module.exports = router;