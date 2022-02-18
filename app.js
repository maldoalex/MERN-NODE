const express = require('express');
const bodyParser = require('body-parser');

const momentsRoutes = require('./routes/moments-routes');

const app = express();

app.use(momentsRoutes);

app.listen(5000);