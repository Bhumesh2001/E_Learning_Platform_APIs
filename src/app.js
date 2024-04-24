require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
const PORT = process.env.PORT;
const userRoutes = require('./routes/userRoute');
const superAdminRoutes = require('./routes/courseRoute');
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-learning Platform APIs',
            version: '1.0.0',
            description: 'API documentation for E-learning Project',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            }
        ],
    },
    apis: ['./controllers/*.js']
};
const swaggerSpec = swaggerJsdoc(options);

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/user', userRoutes);
app.use('/', superAdminRoutes);

app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
    console.log(`Go to api doc http://localhost:${PORT}/api-docs`);
});