require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const formRoutes = require('./routes/forms');
const memberRoutes = require('./routes/members');
const internRoutes = require('./routes/internships');
const issForms = require('./routes/issForms');
const userRoutes = require('./routes/user');
const FacultyRoutes = require('./routes/faculty');
const CourseRoutes = require('./routes/course');
const CharityRoutes = require('./routes/charity');
const PointRoutes = require('./routes/point');
const BookRoutes = require('./routes/book');
const BookingRoutes = require('./routes/booking');
const LecturerRoutes = require('./routes/lecturer');
const GalleryRoutes = require('./routes/gallery');
const megaRoutes = require('./routes/mega'); // Import MEGA routes

const cors = require('cors');
const Multer = require('multer');
const path = require('path');


// express app
const app = express();
app.use(cors());


app.use(express.json());

// const corsOptions = {
//     origin: 'https://issegypt.vercel.app',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
//     optionsSuccessStatus: 204,
// };

// app.use(cors(corsOptions));

// routes
app.use('/api/forms', formRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/internship', internRoutes);
app.use('/api/issForms', issForms);
app.use('/api/user', userRoutes);
app.use('/api/faculty', FacultyRoutes);
app.use('/api/course', CourseRoutes);
app.use('/api/charity', CharityRoutes);
app.use('/api/point', PointRoutes);
app.use('/api/book', BookRoutes);
app.use('/api/booking', BookingRoutes);
app.use('/api/lecturer', LecturerRoutes);
app.use('/api/gallery', GalleryRoutes);
app.use('/api/mega', megaRoutes);
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
