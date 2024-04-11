const express = require('express');
const router = express.Router();
const Courses = require('../controllers/courseController');
const { authorizeToUser } = require('../middlewares/auth');

router.post('/super-admin/register', Courses.superAdminRegister);
router.post('/super-admin/login', Courses.superAdminLogin);

router.post('/super-admin/course/create', authorizeToUser, Courses.createCourse);
router.get('/courses', Courses.getCourses);
router.get('/super-admin/course', authorizeToUser, Courses.getCourse);
router.patch('/super-admin/course/edit', authorizeToUser, Courses.editCourse);
router.delete('/super-admin/course/delete', authorizeToUser, Courses.deleteCourse);

module.exports = router;