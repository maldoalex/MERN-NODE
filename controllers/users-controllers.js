const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');


const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError('Fetching users failed, please try again later.', 500);
    return next(error);
  }
  res.json({users: users.map(user => user.toObject({getters: true}))});
};

// const getUserById = (req, res, next) => {
//   const userId = req.params.uid;
//   const user = DUMMY_MOMENTS.find(u => {
//     return u.creator === userId
//   });
//   if (!user) {
//     throw new HttpError('Could not find a user for the provided user id.', 404);
//   }
//   res.json({user});
// };

const signup = async (req, res, next) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new HttpError('Invalid inputs passed.', 422));
    }
  const {name, email, password} = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({email: email});
  } catch (err) {
    const error = new HttpError('Failed to sign up, please try again.', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User already exists, please login instead.', 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user, please try again.', 500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    moments: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signup failed, please try again.', 500
    );
    return next(error);
  }  

  let token;
  try {
  token = jwt.sign({userId: createdUser.id, email: createdUser.email}, process.env.JWT_KEY, {expiresIn: '1h'});
  } catch (err) {
    const error = new HttpError(
      'Signup failed, please try again.', 500
    );
    return next(error);
  }

  res.status(201).json({userId: createdUser.id, email: createdUser.email, token:token});
};

const login = async (req, res, next) => {
  const {email, password} = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({email: email});
  } catch (err) {
    const error = new HttpError('Failed to log in, please try again.', 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError('Invalid credentials, could not log in', 403);
    return next(error);
  }

  let isValidPassword = false;
  try {
  isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials.', 500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError('Invalid credentials, could not log in', 401);
    return next(error);
  }

  let token;
  try {
  token = jwt.sign({userId: existingUser.id, email: existingUser.email}, process.env.JWT_KEY, {expiresIn: '1h'});
  } catch (err) {
    const error = new HttpError(
      'Login failed, please try again.', 500
    );
    return next(error);
  }

  res.json({userId: existingUser.id, email: existingUser.email, token: token});
};

// const updateUser = (req, res, next) => {};

// const deleteUser = (req, res, next) => {};

exports.getUsers = getUsers;
// exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
// exports.updateUser = updateUser;
// exports.deleteUser = deleteUser;