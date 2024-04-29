require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const ngrok = require('ngrok');
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

app.get('/', (req, res) => {
    res.send('<h1>WELCOME! This is home page</h1>');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/user', userRoutes);
app.use('/', superAdminRoutes);

app.listen(PORT, async () => {
    console.log(`server running at http://localhost:${PORT}`);
    console.log(`Go to api doc http://localhost:${PORT}/api-docs`);
    const url = await ngrok.connect({
        proto: 'http',
        addr: PORT,
        authtoken: process.env.NGROK_AUTH_TOKEN,
    });
    console.log(url);
});