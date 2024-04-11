const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required."],
        minLength: 2,
    },
    email: {
        type: String,
        required: [true, "email is required."],
        unique: true,
        lowercase: true,
        immutable: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Invalid email',
        }
    },
    password: {
        type: String,
        required: [true, "password is required."],
        unique: true,
    },
    profilePicture: {
        type: String,
        default: null,
    },
    dateOfBirth: {
        type: Date,
        default: null,
    },
    gender: {
        type: String,
        default: null,
    },
    country: {
        type: String,
        default: null,
    },
    city: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        default: null
    },
    interests: {
        type: [String],
        default: null
    },
    role: {
        type: String,
        enum: ['user'],
        default: "user",
    },
    coursesEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ],
    permissions: {
        type: [String],
        default: ["profile", "edit", "enrole" ,"courses"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
    },
});

exports.User = mongoose.model('User', userSchema);