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
  let moments;
  
  try {
    moments = await Moment.find({creator: userId})
  } catch (err) {
    const error = new HttpError('Could not find moment by entered Id, please try again.', 500);
    return next(error);
  }

  if (!moments || moments.length === 0) {
    return next(new HttpError('Could not find moments for the provided user id.', 404));
  }
  res.json({moments: moments.map(moment => moment.toObject({getters: true}))});
};

const createMoment = async (req, res, next) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new HttpError('Invalid inputs passed.', 422));
    }
  const {title, description, address, creator} = req.body;

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
    location: coordinates,
    image: 'https://images.unsplash.com/photo-1519057016395-76b7690327e0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8NXwxNDI1MDh8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=60',
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

  res.status(200).json({message: 'Deleted moment.'})
};

exports.getMomentById = getMomentById;
exports.getMomentsByUserId = getMomentsByUserId;
exports.createMoment = createMoment;
exports.updateMoment = updateMoment;
exports.deleteMoment = deleteMoment;