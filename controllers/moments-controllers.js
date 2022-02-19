const { v4: uuidv4 } = require('uuid');
const {validationResult} = require('express-validator');
const HttpError = require('../models/http-error');

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

const getMomentById = (req, res, next) => {
  const momentId = req.params.mid;
  const moment = DUMMY_MOMENTS.find(m => {
    return m.id === momentId;
  });

  if (!moment) {
    throw new HttpError('Could not find a moment for the provided moment id.', 404);
  }
  res.json({moment});
};

const getMomentsByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const moments = DUMMY_MOMENTS.filter(m => {
    return m.creator === userId;
  });

  if (!moments || moments.length === 0) {
    return next(HttpError('Could not find moments for the provided user id.', 404));
  }
  res.json({moments});
};

const createMoment = (req, res, next) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError('Invalid inputs passed.', 422)
    }
  const {title, description, coordinates, creator} = req.body;

  const createdMoment = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    creator
  };
  DUMMY_MOMENTS.push(createdMoment);

  res.status(201).json({moment: createdMoment});
};

const updateMoment = (req, res, next) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError('Invalid inputs passed.', 422)
    }

  const {title, description} = req.body;
  const momentId = req.params.mid;

  const updatedMoment = {...DUMMY_MOMENTS.find(m => m.id === momentId)};
  const placeIndex = DUMMY_MOMENTS.findIndex(m => m.id === momentId);
  updatedMoment.title = title;
  updatedMoment.description = description;

  DUMMY_MOMENTS[placeIndex] = updatedMoment;

  res.status(200).json({moment: updatedMoment});
};

const deleteMoment = (req, res, next) => {
  const momentId = req.params.mid; 
  if (!DUMMY_MOMENTS.find(m => m.id === momentId)) {
    throw new HttpError('Could not find a moment for that id.', 404);
  }
  DUMMY_MOMENTS = DUMMY_MOMENTS.filter(m => m.id !== momentId);
  res.status(200).json({message: 'Deleted moment.'})
};

exports.getMomentById = getMomentById;
exports.getMomentsByUserId = getMomentsByUserId;
exports.createMoment = createMoment;
exports.updateMoment = updateMoment;
exports.deleteMoment = deleteMoment;