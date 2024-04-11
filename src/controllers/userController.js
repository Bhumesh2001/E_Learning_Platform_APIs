const { User } = require('../models/userModel');
const { Course } = require('../models/courseModel');
const { sendEmail } = require('../controllers/sendEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
        res.status(200).send({ success: true, message: "User Registration successful..." });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({ error: 'Validation Error', details: validationErrors });
        } else if (error.code === 11000) {
            res.status(400).json({ error: 'User allready exists' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        };
    };
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ success: false, message: "this fields are required" });
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

exports.viewProfile = async (req, res) => {
    try {
        const profile = req.data;
        res.status(200).send({ success: true, profile });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};

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
            return res.status(400).json({ success: false, msg: 'User is already enrolled in this course' });
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

exports.viewEnrolledCourses = async (req, res) => {
    try {
        const _id = req.data._id;
        const courses = await User.find({ _id }).populate({ path: 'coursesEnrolled', select: '-__v' });
        if(courses[0].coursesEnrolled.length !== 0){
            res.status(200).send({ success: true, enrolledCourses: courses[0].coursesEnrolled });
        }else{
            res.status(404).send({ success: true, message: "No enrolled courses." });
        };
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};