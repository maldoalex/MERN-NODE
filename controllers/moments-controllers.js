const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const {validationResult} = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Moment = require('../models/moment');
const User = require('../models/user');


const getMomentById = async (req, res, next) => {
  const momentId = req.params.mid;
  let moment;

  try {
    moment = await Moment.findById(momentId);
  } catch (err) {
    const error = new HttpError('Something went wrong, could not find moment.', 500);
    return next(error);
  }

  if (!moment) {
    const error = new HttpError('Could not find a moment for the provided moment id.', 404);
    return next(error);
  }
  res.json({moment: moment.toObject({getters: true})});
};

const getMomentsByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userWithMoments;
  
  try {
    userWithMoments = await User.findById(userId).populate('moments');
  } catch (err) {
    const error = new HttpError('Fetching moments failed, please try again.', 500);
    return next(error);
  }

  if (!userWithMoments || userWithMoments.moments.length === 0) {
    return next(new HttpError('Could not find moments for the provided user id.', 404));
  }
  res.json({moments: userWithMoments.moments.map(moment => moment.toObject({getters: true}))});
};

const createMoment = async (req, res, next) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new HttpError('Invalid inputs passed.', 422));
    }
  const {title, description, address, date, haikuone, haikutwo, haikuthree, creator} = req.body;

  let coordinates;

  try {
    coordinates = await getCoordsForAddress(address); 
  } catch (error) {
    return next(error);
  }

  const createdMoment = new Moment({
    title,
    description,
    address,
    date,
    haikuone,
    haikutwo,
    haikuthree,
    location: coordinates,
    image: req.file.path,
    creator
  });

  let user;

  try {
    user = await User.findById(creator); 
  } catch (err) {
    const error = new HttpError('Creating moment failed, please try again', 500);    
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdMoment.save({session: sess});
    user.moments.push(createdMoment);
    await user.save({session:sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating moment failed, please try again.', 500
    );
    return next(error);
  }

  res.status(201).json({moment: createdMoment});
};

const updateMoment = async (req, res, next) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new HttpError('Invalid inputs passed.', 422));
    }

  const {title, description} = req.body;
  const momentId = req.params.mid;

  let moment;
  try {
    moment = await Moment.findById(momentId);
  } catch (err) {
    const error = new HttpError(
      'Failed to update moment, please try again.', 500
    );
    return next(error);
  }

  moment.title = title;
  moment.description = description;

  try {
    await moment.save();
  } catch (err) {
    const error = new HttpError(
      'Failed to update moment, please try again.', 500
    );
    return next(error);
  }

  res.status(200).json({moment: moment.toObject({getters: true})});
};

const deleteMoment = async (req, res, next) => {
  const momentId = req.params.mid; 
  let moment;

  try {
    moment = await Moment.findById(momentId).populate('creator');
  } catch (err) {
    const error = new HttpError('Could not find moment by Id, please try again.', 500);
    return next(error);
  }

  if (!moment) {
    const error = new HttpError('Could not find moment for id', 404);
    return next(error);
  }

  const imagePath = moment.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await moment.remove(({session: sess}));
    moment.creator.moments.pull(moment);
    await moment.creator.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Could not find moment by Id, please try again.', 500
    );
    return next(error);
  }

  fs.unlink(imagePath, err => {
    console.log(err);
  });

  res.status(200).json({message: 'Deleted moment.'})
};

exports.getMomentById = getMomentById;
exports.getMomentsByUserId = getMomentsByUserId;
exports.createMoment = createMoment;
exports.updateMoment = updateMoment;
exports.deleteMoment = deleteMoment;