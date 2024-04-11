const { Course, Superadmin } = require('../models/courseModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

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
        res.status(500).send({ success: true, message: "Superadmin registered successful..." });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({ error: 'Validation Error', details: validationErrors });
        } else if (error.code === 11000) {
            res.status(400).json({ error: 'Superadmin already exists' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        };
    };
};

exports.superAdminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ success: false, message: "This fields are required" });
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

exports.createCourse = async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(200).send({ success: true, message: "Course created successfully..." });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({ error: 'Validation Error', details: validationErrors });
        } else if (error.code === 11000) {
            res.status(400).json({ error: 'This course allready avilable at the platform.' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        };
    };
};

exports.getCourses = async (req, res) => {
    try {
        const { popularity, course, ...filters } = req.body;
        const limit = 10;
        const page = req.query.page || 1;
        const skip = (page - 1) * limit;
        const filtersObj = {
            title: course,
            ...filters,
        };
        let aggregationPipeline = [];
        Object.entries(filtersObj).forEach(([key, value]) => {
            if (value !== "") {
                const matchStage = {};
                matchStage[key] = { $regex: `.*${value}.*`, $options: 'i' };
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

exports.getCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).send({ success: false, message: "Course not found" });
        };
        res.status(200).send({ success: true, course });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};

exports.editCourse = async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) {
            return res.status(400).send({ success: false, message: "Id is required." });
        };
        await Course.findOneAndUpdate({ _id }, { $set: req.body });
        res.status(200).send({ success: true, message: "Course updated successfully..." });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};

exports.deleteCourse = async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) {
            return res.status(400).send({ success: false, message: "Id is required." });
        };
        await Course.findByIdAndDelete({ _id });
        res.status(200).send({ success: true, message: "Course deleted successfully..." });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    };
};