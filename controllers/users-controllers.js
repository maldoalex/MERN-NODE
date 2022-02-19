const { v4: uuidv4 } = require('uuid');
const {validationResult} = require('express-validator');

const HttpError = require('../models/http-error');

let DUMMY_USERS = [
  {
    id: 'u1',
    userName: 'Alex Maldonado',
    email: 'test@test.com',
    password: 'testers'
  }
];

const getUsers = (req, res, next) => {
  res.json({users: DUMMY_USERS});
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

const signup = (req, res, next) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpError('Invalid inputs passed.', 422)
    }
  const {userName, email, password} = req.body;

  const hasUser = DUMMY_USERS.find(u => u.email === email);
  if (hasUser) {
    throw new HttpError('Could not create user, email already exists', 422);
  };

  const createdUser = {
    id: uuidv4(),
    userName, 
    email,
    password
  };

  DUMMY_USERS.push(createdUser);
  res.status(201).json({user: createdUser});
};

const login = (req, res, next) => {
  const {email, password} = req.body;

  const identifiedUser = DUMMY_USERS.find(u => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError('Could not identify user.', 401);
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