require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const formRoutes = require('./routes/forms');
const memberRoutes = require('./routes/members');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// express app
const app = express();

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Check if the 'images' directory exists, create it if not

        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// routes
app.use('/api/forms', formRoutes);
app.use('/api/member', memberRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

// connect to db
console.log('MongoDB URI:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => {
        console.log('connected to database');
        // listen to port
        app.listen(process.env.PORT, () => {
            console.log('listening for requests on port', process.env.PORT);
        });
    })
    .catch((err) => {
        console.log(err);
    });
