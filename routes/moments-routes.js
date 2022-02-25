const express = require('express');
const {check} = require('express-validator');

const momentsControllers = require('../controllers/moments-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();



router.get('/:mid', momentsControllers.getMomentById);

router.get('/user/:uid', momentsControllers.getMomentsByUserId);

router.use(checkAuth);

router.post(
  '/', 
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(), 
    check('description').isLength({min: 5}),
    check('address').not().isEmpty()

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