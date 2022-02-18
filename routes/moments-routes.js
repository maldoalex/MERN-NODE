const express = require('express');

const router = express.Router();

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

router.get('/:mid', (req, res, next) => {
  const momentId = req.params.mid;
  const moment = DUMMY_MOMENTS.find(m => {
    return m.id === momentId;
  });

  if (!moment) {
    const error = new Error('Could not find a moment for the provided moment id.');
    error.code = 404;
    throw error;
  }
  res.json({moment});
});

router.get('/user/:uid', (req, res, next) => {
  const userId = req.params.uid;
  const moment = DUMMY_MOMENTS.find(m => {
    return m.creator === userId;
  });

  if (!moment) {
    const error = new Error('Could not find a moment for the provided user id.');
    error.code = 404;
    return next(error);
  }
  res.json({moment});
});

module.exports = router;