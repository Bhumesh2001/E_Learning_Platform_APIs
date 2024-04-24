const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');
const { Superadmin } = require('../models/courseModel');

exports.authorizeToUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decode = jwt.verify(token, process.env.SecretKey);
            const info = Object.entries(decode)[0];
            const dataObj = Object.fromEntries([info]);
            let data;
            if (info[0] === "email") {
                data = await User.findOne(dataObj);
            } else {
                data = await Superadmin.findOne(dataObj);
            };
            const permission = req.originalUrl.split('/').slice(-1)[0];
            if (data.permissions.includes(permission)) {
                req.data = data;
                next();
            } else {
                const message = data.role === 'user' ? "You have no permission to do this operation" : "Your are not user";
                res.status(200).send({ success: false, message });
            };
        } else {
            return res.status(401).send({ message: "please login..." });
        };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(419).json({ message: 'Your Session has expired, please login.' });
        } else if (error.name === 'JsonWebTokenError') {
            res.status(498).json({ message: 'Invalid token, please log in again.' });
        } else {
            res.status(500).json({ message: 'Internal Server Error', error });
        };
    };
};