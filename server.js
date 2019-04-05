import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import config from 'config';
import logger from 'morgan';
import path from 'path';

// Import routes
import indexRoute from './routes/api';
import bookRoute from './routes/api/book';
import authRoute from './routes/user/auth';
import userRoute from './routes/user/user';

// Import MongoURI
const mongoURI = config.get('MONGO_URI');

const app = express();
const server = createServer(app);

// Use http logger middleware
app.use(logger('dev'));

// Using express middleware functions for parsing json body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Handling CORS Errors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT POST PATCH GET DELETE');
    return res.status(200).json({});
  }
  next();
});

// Set static folder
app.use('/public', express.static(path.resolve(__dirname, 'public')));

// Using routes
app.use('/api/test', indexRoute);
app.use('/api', bookRoute);
app.use('/users', authRoute);
app.use('/users', userRoute);

// Set port
app.set('port', process.env.PORT || 5000);

// Use mongoose promise library
mongoose.Promise = require('bluebird');

// Connecting to mongodb
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useCreateIndex: true })
  .then(res => {
    // Listening to server
    server.listen(app.get('port'), () =>
      console.log(`server running on port ${app.get('port')}...`)
    );
    console.log(`connecting to mongodb...`);
  })
  .catch(err => {
    throw err.message;
  });
