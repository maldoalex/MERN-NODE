const express = require('express');
const bodyParser = require('body-parser');

const momentsRoutes = require('./routes/moments-routes');
const usersRoutes = require('./routes/users-routes');

const app = express();

app.use('/api/moments', momentsRoutes);

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500)
  res.json({message: error.message || 'An unknown error occurred.'});
});

app.listen(5000);