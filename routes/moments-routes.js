const express = require('express');
const {check} = require('express-validator');

const momentsControllers = require('../controllers/moments-controllers');

const router = express.Router();



router.get('/:mid', momentsControllers.getMomentById);

router.get('/user/:uid', momentsControllers.getMomentsByUserId);

router.post(
  '/', 
  [
    check('title').not().isEmpty(), 
    check('description').isLength({min: 5}),

  ],
  momentsControllers.createMoment);

router.patch(
  '/:mid',
  [
    check('title').not().isEmpty(), 
    check('description').isLength({min: 5}),
  ], 
  momentsControllers.updateMoment);

router.delete('/:mid', momentsControllers.deleteMoment);

module.exports = router;