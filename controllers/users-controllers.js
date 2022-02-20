const { v4: uuidv4 } = require('uuid');
const {validationResult} = require('express-validator');

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

const getUserById = (req, res, next) => {
  const userId = req.params.uid;
  const user = DUMMY_MOMENTS.find(u => {
    return u.creator === userId
  });
  if (!user) {
    throw new HttpError('Could not find a user for the provided user id.', 404);
  }
  res.json({user});
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new HttpError('Invalid inputs passed.', 422));
    }
  const {userName, email, password} = req.body;

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

  const createdUser = new User({
    userName,
    email,
    password,
    image: 'https://images.unsplash.com/photo-1547823065-4cbbb2d4d185?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8bXQlMjBmdWppfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
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
  res.status(201).json({user: createdUser.toObject({getters: true})});
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

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError('Invalid credentials, could not log in', 401);
    return next(error);
  }

  res.json({message: 'Logged in!'});
};

const updateUser = (req, res, next) => {};

const deleteUser = (req, res, next) => {};

exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;