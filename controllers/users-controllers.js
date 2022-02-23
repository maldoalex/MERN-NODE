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

  const createdUser = new User({
    name,
    email,
    password,
    image: 'https://d2lzb5v10mb0lj.cloudfront.net/darkhorse/downloads/desktops/berserkv1/tablet.jpg',
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

  res.json({message: 'Logged in!', user: existingUser.toObject({getters: true})});
};

// const updateUser = (req, res, next) => {};

// const deleteUser = (req, res, next) => {};

exports.getUsers = getUsers;
// exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;
// exports.updateUser = updateUser;
// exports.deleteUser = deleteUser;