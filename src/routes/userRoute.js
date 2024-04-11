const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authorizeToUser } = require('../middlewares/auth');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

router.get('/profile', authorizeToUser, userController.viewProfile);
router.patch('/profile/edit', authorizeToUser, userController.editProfile);
router.post('/enrole', authorizeToUser, userController.enroleInCourse);
router.get('/view-enrolled/courses', authorizeToUser, userController.viewEnrolledCourses);

module.exports = router; 