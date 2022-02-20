const { v4: uuidv4 } = require('uuid');
const {validationResult} = require('express-validator');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Moment = require('../models/moment');
const moment = require('../models/moment');

let DUMMY_MOMENTS = [
  {
    id: 'm1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  }
];

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

  try {
    await createdMoment.save();
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
      throw new HttpError('Invalid inputs passed.', 422)
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
    moment = await Moment.findById(momentId);
  } catch (err) {
    const error = new HttpError('Could not find moment by Id, please try again.', 500);
    return next(error);
  }

  try {
    await moment.remove();
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