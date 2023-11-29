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
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Origin', 'https://issegypt.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});



const corsOptions = {
    origin: 'https://issegypt.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));


// const allowCors = fn => async (req, res) => {
//     res.setHeader('Access-Control-Allow-Credentials', true)
//     res.setHeader('Access-Control-Allow-Origin', '*')
//     // another common pattern
//     // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
//     res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
//     res.setHeader(
//         'Access-Control-Allow-Headers',
//         'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
//     )
//     if (req.method === 'OPTIONS') {
//         res.status(200).end()
//         return
//     }
//     return await fn(req, res)
// }

// const handler = (req, res) => {
//     const d = new Date()
//     res.end(d.toString())
// }
// module.exports = allowCors(handler)


// routes
app.use('/api/forms', formRoutes);
app.use('/api/member', memberRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads', express.static('uploads'));
// connect to db
console.log('MongoDB URI:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => {
        console.log('connected to the database');
        // listen to port
        app.listen(process.env.PORT, () => {
            console.log('listening for requests on port', process.env.PORT);
        });
    })
    .catch((err) => {
        console.log(err);
    });
