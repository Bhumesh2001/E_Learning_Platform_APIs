const { Course, Superadmin } = require('../models/courseModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

/**
 * @swagger
 * /super-admin/register:
 *  post:
 *      summary: Register as a superadmin
 *      tags:
 *         - Register super admin
 *      requestBody:
 *          description: register super-admin
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          username:
 *                              type: string
 *                          email:
 *                              type: string
 *                          password:
 *                              type: string
 *      responses:
 *          201:
 *              description: Superadmin registered successful...
 *          401:
 *              description: Password must be strong
 *          403:
 *              description: validation error
 *          409:
 *              description: Superadmin already exists
 *          500:
 *              description: Internal server error       
 */

exports.superAdminRegister = async (req, res) => {
    try {
        const { password, ...data } = req.body;
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regex.test(password)) {
            return res.status(401).send({ success: false, message: "Password must be strong" });
        };
        const dataObj = {
            password: await bcrypt.hash(password, saltRounds),
            ...data,
        };
        const superAdmin = new Superadmin(dataObj);
        await superAdmin.save();
        res.status(201).send({ success: true, message: "Superadmin registered successful..." });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(403).json({ error: 'Validation Error', details: validationErrors });
        } else if (error.code === 11000) {
            res.status(409).json({ error: 'Superadmin already exists' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        };
    };
};

/**
 * @swagger
 * /super-admin/login:
 *  post:
 *      summary: login super-admin
 *      tags:
 *         - login as a super admin
 *      requestBody:
 *          description: login super admin
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          username:
 *                              type: string
 *                          password:
 *                              type: string
 *      responses:
 *          200:
 *              description: Superadmin logged in successful...' 
 *          499:
 *              description: This fields are required
 *          401:
 *              description: Invalid credential
 *          500:
 *              description: Internal server error
 */

exports.superAdminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(499).send({ success: false, message: "This fields are required" });
        };
        const superAdmin = await Superadmin.findOne({ username });
        if (!superAdmin || !await bcrypt.compare(password, superAdmin.password)) {
            return res.status(401).send({ success: false, message: "Invalid credential" });
        };
        await Superadmin.findOneAndUpdate({ username }, { $set: { lastLogin: Date.now() } });
        const token = jwt.sign({ username }, process.env.SecretKey, { expiresIn: '12h' });

        res.cookie('token', token, { httpOnly: true, maxAge: 43200000 });
        res.status(200).send({ success: true, message: 'Superadmin logged in successful...' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};

/**
 * @swagger
 * /super-admin/course/create:
 *  post:
 *      summary: create a course
 *      tags:
 *         - Register a course
 *      requestBody:
 *          description: register new course
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          title:
 *                              type: string
 *                          description:
 *                              type: string
 *                          duration: 
 *                              type: string
 *                          level:
 *                              type: string
 *                          category: 
 *                              type: string
 *                          price:
 *                              type: string
 *                          freeOrPaid:
 *                              type: string
 *                          enrolledStudents:
 *                              type: number
 *                          rating:
 *                              type: number
 *                          provider:
 *                              type: string
 *                          instructorExperience:
 *                              type: string
 *                          reviews:
 *                              type: string
 *                          outcome:
 *                              type: string
 *                          accessibility:
 *                              type: boolean
 *                          location: 
 *                              type: string
 *      responses:
 *          201:
 *              description: Course created successfully...
 *          403:
 *              description: Validation error
 *          409:
 *              description: This course allready avilable at the platform.
 *          500:
 *              description: Internal Server Error
 */

exports.createCourse = async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).send({ success: true, message: "Course created successfully..." });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(403).json({ error: 'Validation Error', details: validationErrors });
        } else if (error.code === 11000) {
            res.status(409).json({ error: 'This course allready avilable at the platform.' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        };
    };
};

/**
 * @swagger
 * /courses:
 *  get:
 *      summary: get courses by using filters
 *      tags:
 *         - get courses by filters
 *      parameters:
 *         - in: query
 *           name: title
 *           description: get courses by applying filters like javaScript, python
 *         - in: query
 *           name: level
 *           description: biginner, intermidiate, advanced
 *         - in: query
 *           name: category
 *           description: like web developement, mobile development, app, programming
 *         - in: query
 *           name: location
 *           description: online, mumbai, pune
 *         - in: query
 *           name: language
 *           description: hindi, english
 *         - in: query
 *           name: duration
 *           description: 40 hours, 6 month like that
 *         - in: query
 *           name: provider
 *           description: udemy etc
 *         - in: query
 *           name: popularity
 *           description: like 5, 3, 8 like that...
 *      responses:
 *          200:
 *              description: operation successfull...
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success: 
 *                                  type: boolean
 *                              courses:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *          404:
 *              description: courses not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success: 
 *                                  type: boolean
 *                              message:
 *                                  type: string
 *          500:
 *              description: Internal server error
 */

exports.getCourses = async (req, res) => {
    try {
        const { popularity, page, ...filters } = req.query;
        const limit = 10;
        const Page = page || 1;
        const skip = (Page - 1) * limit;
        let aggregationPipeline = [];
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== "") {
                const matchStage = {};
                matchStage[key] = { $regex: `${value}`, $options: 'i' };
                aggregationPipeline.push({ $match: matchStage });
            };
        });
        if (popularity) {
            aggregationPipeline.push({ $sort: { enrolledStudents: -1 } });
            aggregationPipeline.push({ $limit: parseInt(popularity) });
        };
        if (aggregationPipeline.length !== 0) {
            aggregationPipeline.push({ $project: { __v: 0 } });
            aggregationPipeline.push({ $skip: skip });
            aggregationPipeline.push({ $limit: limit });
            const courses = await Course.aggregate(aggregationPipeline);
            if (courses.length === 0) {
                return res.status(404).send({ success: true, courses, message: "courses not found" });
            };
            res.status(200).send({ success: true, courses });
        } else {
            const pipeline = [
                { $project: { __v: 0 } },
                { $skip: skip },
                { $limit: limit }
            ];
            const Courses = await Course.aggregate(pipeline);
            if (Courses.length === 0) {
                return res.status(404).send({ success: true, Courses, message: "courses not found" });
            };
            res.status(200).send({ success: true, Courses });
        };
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};

/**
 * @swagger
 * /super-admin/course:
 *   get:
 *     summary: Get a course
 *     tags:
 *       - Get course
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course to retrieve
 *     responses:
 *       200:
 *         description: Operation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: 
 *                   type: boolean
 *                 course:
 *                   type: object
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: 
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */

exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.query.courseId);
        if (!course) {
            return res.status(404).send({ success: false, message: "Course not found" });
        };
        res.status(200).send({ success: true, course });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};

/**
 * @swagger
 * /super-admin/course/edit:
 *  patch:
 *      summary: Edit course
 *      tags:
 *        - Edit course
 *      requestBody:
 *          description: update the course details
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          _id:
 *                              type: string
 *                          title:
 *                              type: string
 *                          description:
 *                              type: string
 *                          duration:
 *                              type: string
 *                          level:
 *                              type: string
 *                          category:
 *                              type: string
 *                          price:
 *                              type: string
 *                          freeOrPaid:
 *                              type: string
 *                          enrolledStudents:
 *                              type: number
 *                          rating:
 *                              type: number
 *                          provider:
 *                              type: string
 *                          instructorExperience:
 *                              type: number
 *                          reviews:
 *                              type: string
 *                          outcome: 
 *                              type: string
 *                          accessibility:
 *                              type: boolean
 *                          location:
 *                              type: string
 *      responses:
 *          200:
 *              description: Course updated successfully...
 *          499:
 *              description: Id is required
 *          500:
 *              description: Internal server error
 */

exports.editCourse = async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) {
            return res.status(499).send({ success: false, message: "Id is required." });
        };
        await Course.findOneAndUpdate({ _id }, { $set: req.body });
        res.status(200).send({ success: true, message: "Course updated successfully..." });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};

/**
 * @swagger
 * /super-admin/course/delete:
 *   delete:
 *     summary: Delete the course
 *     tags:
 *       - Delete course by ID
 *     parameters:
 *       - in: query
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course to delete
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       499:
 *         description: ID is required
 *       500:
 *         description: Internal server error
 */

exports.deleteCourse = async (req, res) => {
    try {
        const _id = req.query._id;
        if (!_id) {
            return res.status(499).send({ success: false, message: "Id is required." });
        };
        await Course.findByIdAndDelete({ _id });
        res.status(200).send({ success: true, message: "Course deleted successfully..." });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};