const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/http-error');

const DUMMY_MOMENTS = [
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

const getMomentByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const moment = DUMMY_MOMENTS.find(m => {
    return m.creator === userId;
  });

  if (!moment) {
    return next(HttpError('Could not find a moment for the provided user id.', 404));
  }
  res.json({moment});
};

const createMoment = (req, res, next) => {
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

exports.getMomentById = getMomentById;
exports.getMomentByUserId = getMomentByUserId;
exports.createMoment = createMoment;