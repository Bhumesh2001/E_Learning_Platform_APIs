const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "title is required."],
        minLength: 2,
        unique: true,
    },
    description: {
        type: String,
        required: [true, "discription is required."],
    },
    duration: {
        type: String,
        required: [true, "duration is required."],
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: [true, "level is required."],
    },
    category: {
        type: String,
        required: [true, "category is required."],
    },
    price: {
        type: String,
        required: [true, "price is required."],
    },
    freeOrPaid: {
        type: String,
        required: [true, "freeOrPaid is required"],
    },
    enrolledStudents: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: [true, "rating is required."],
    },
    provider: {
        type: String,
        required: [true, "provider is required."],
    },
    instructorExperience: {
        type: Number,
        required: [true, "instructorExperience is required."],
    },
    reviews: {
        type: Number,
        required: [true, "reviews are required."],
    },
    outcome: {
        type: String,
        required: [true, "outcome is required."],
    },
    accessibility: {
        type: Boolean,
        default: true,
    },
    location: {
        type: String,
        required: [true, "location is required."],
    }
});

const superadminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required. Please provide a username.'],
        unique: true,
        validate: {
            validator: function (value) {
                return /^[a-zA-Z0-9_-]{3,16}$/.test(value);
            },
            message: props => `${props.value} is not a valid username! 
            Username must be alphanumeric and between 3 to 16 characters long, 
            and can contain underscores (_) or dashes (-).`
        },
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        lowercase: true,
        immutable: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Invalid email format',
        },
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        unique: true,
    },
    role: {
        type: String,
        enum: ['Superadmin'],
        default: 'Superadmin',
    },
    permissions: {
        type: [String],
        default: ['create', 'edit', 'delete', 'course'],
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
});

exports.Course = mongoose.model('Course', courseSchema);
exports.Superadmin = mongoose.model('Superadmin', superadminSchema);