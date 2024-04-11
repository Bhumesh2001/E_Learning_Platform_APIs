require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT;
const userRoutes = require('./routes/userRoute');
const superAdminRoutes = require('./routes/courseRoute');

app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.dbURI);
const db = mongoose.connection;

db.on('connected', () => {
    console.log('connected to mongodb');
});

db.on('error', (err) => {
    console.log('connection error:', err);
});

app.use('/user', userRoutes);
app.use('/', superAdminRoutes);

app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});