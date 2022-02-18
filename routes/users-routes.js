const express = require('express');

const usersControllers = require('../controllers/users-controllers');

const router = express.Router();

router.get('/', usersControllers.getUsers);

router.get('/:uid', usersControllers.getUserById);

router.post('/signup', usersControllers.signup);

router.post('/login', usersControllers.login);

router.patch('/:uid', usersControllers.updateUser);

router.delete('/:uid', usersControllers.deleteUser);

module.exports = router;