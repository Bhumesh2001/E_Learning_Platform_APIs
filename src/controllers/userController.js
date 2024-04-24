const { User } = require('../models/userModel');
const { Course } = require('../models/courseModel');
const { sendEmail } = require('../controllers/sendEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Register new user
 *     requestBody:
 *       description: Insert new user into the database
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: User registration successful
 *       '401':
 *         description: Password must be strong
 *       '400':
 *         description: Bad request, check your request body
 */

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regex.test(password)) {
            return res.status(401).send({ success: false, message: "password must be strong" });
        };
        const dataObj = {
            name, email, password: await bcrypt.hash(password, saltRounds),
        };
        const user = new User(dataObj);
        await user.save();

        sendEmail(email, name, 1);
        res.status(201).send({ success: true, message: "User Registration successful..." });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(403).json({ error: 'Validation Error', details: validationErrors });
        } else if (error.code === 11000) {
            res.status(409).json({ error: 'User allready exists' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        };
    };
};

/**
 * @swagger
 * /user/login:
 *  post:
 *      summary: Login the user
 *      tags:
 *        - Login the User
 *      requestBody:
 *          description: login to your web app
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                     type: object
 *                     properties:
 *                         email:
 *                           type: string
 *                         password:
 *                           type: string
 *      responses:
 *          200:
 *            description: User logged in successful...
 *          499:
 *            description: This fields are required
 *          401:
 *            description: Invalid credential
 *          500:
 *            description: Internal server error
 */

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(499).send({ success: false, message: "this fields are required" });
        };
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).send({ success: false, message: "Invalid credential" });
        };
        const token = jwt.sign({ email }, process.env.SecretKey, { expiresIn: '12h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 43200000 });
        res.status(200).send({ success: true, message: 'User Logged in successful...' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};

/**
 * @swagger
 * /user/profile:
 *  get:
 *      summary: Get the profile
 *      tags:
 *         - Get your profile
 *      responses:
 *          200:
 *              description: your profile
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                              profile:
 *                                  type: object
 *                                  properties:
 *                                      _id:
 *                                          type: string
 *                                      name:
 *                                          type: string
 *                                      email:
 *                                          type: string
 *                                      password:
 *                                          type: string
 *                                      profilePicture:
 *                                          type: string
 *                                      dateOfBirth:
 *                                          type: string
 *                                      gender:
 *                                          type: string
 *                                      country:
 *                                          type: string
 *                                      city: 
 *                                          type: string
 *                                      bio: 
 *                                          type: string
 *                                      interests: 
 *                                          type: [string]
 *                                      role: 
 *                                          type: string
 *                                      coursesEnrolled:
 *                                          type: [string]
 *                                      permissions: 
 *                                          type: [string]
 *                                      createdAt:
 *                                          type: string
 *                                      __v:
 *                                          type: number
 *          500:
 *              description: Internal server error
 */

exports.viewProfile = async (req, res) => {
    try {
        const profile = req.data;
        res.status(200).send({ success: true, profile });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};

/**
 * @swagger
 * /user/profile/edit:
 *  patch:
 *      summary: update the profile
 *      tags:
 *         - Update your profile
 *      requestBody:
 *          description: update your profile
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                          password: 
 *                              type: string
 *                          profilePicture:
 *                              type: string
 *                          dateOfBirth:
 *                              type: string
 *                          gender:
 *                              type: string
 *                          country:
 *                              type: string
 *                          bio:
 *                              type: string
 *                          interests:
 *                              type: string
 *      responses:
 *          200:
 *              description: Updated profile
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                              updatedProfile:
 *                                  type: object
 *          500:
 *              description: Internal server error
 */

exports.editProfile = async (req, res) => {
    try {
        const email = req.data.email;
        const { password, ...data } = req.body;
        const dataObj = {
            ...data,
            password: await bcrypt.hash(password, saltRounds),
            updatedAt: Date.now(),
        };
        const updatedProfile = await User.findOneAndUpdate(
            { email },
            { $set: dataObj },
            { new: true }
        );
        res.status(200).send({ success: true, updatedProfile });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};

/**
 * @swagger
 * /user/enrole:
 *  post:
 *      summary: enrole in course
 *      tags:
 *         - Enrole in a course
 *      requestBody:
 *          description: enrole in any course
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          courseId:
 *                              type: string
 *      responses:
 *          200:
 *              description: User enrolled in this course successfully
 *          409:
 *              description: User is already enrolled in this course
 *          404:
 *              description: User or course not found
 *          500:
 *              description: Internal server error
 */

exports.enroleInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.data._id.toString();

        const user = await User.findById(userId);
        const course = await Course.findById(courseId);

        if (!user || !course) {
            return res.status(404).json({ msg: 'User or course not found' });
        };
        const isEnrolled = user.coursesEnrolled.some(courseRef => courseRef.toString() === courseId);
        if (isEnrolled) {
            return res.status(409).json({ success: false, msg: 'User is already enrolled in this course' });
        };
        user.coursesEnrolled.push(course);
        course.enrolledStudents++;

        await user.save();
        await course.save();

        sendEmail(user.email, user.name, 2);
        res.status(200).send({ success: true, msg: 'User enrolled in this course successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};

/**
 * @swagger
 * /user/view-enrolled/courses:
 *  get:
 *      summary: view enrolled courses
 *      tags:
 *         - Get enrolled courses
 *      responses:
 *          200:
 *              description: enrolled courses
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success: 
 *                                  type: boolean
 *                              enrolledCourses:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *          404:
 *              description: No enrolled courses
 *          500:
 *              description: Internal server error
 */

exports.viewEnrolledCourses = async (req, res) => {
    try {
        const _id = req.data._id;
        const courses = await User.find({ _id }).populate({ path: 'coursesEnrolled', select: '-__v' });
        if (courses[0].coursesEnrolled.length !== 0) {
            res.status(200).send({ success: true, enrolledCourses: courses[0].coursesEnrolled });
        } else {
            res.status(404).send({ success: true, message: "No enrolled courses." });
        };
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};