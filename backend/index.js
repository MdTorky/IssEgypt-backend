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
const faqRoutes = require('./routes/FAQ');
const productRoutes = require('./routes/product');
const transactionRoutes = require('./routes/transactions');
// const { OpenAI } = require('openai'); // Correct way to import


const megaRoutes = require('./routes/mega'); // Import MEGA routes

const cors = require('cors');
const Multer = require('multer');
const path = require('path');



// express app
const app = express();
app.use(cors());
app.use(express.json());


// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY, // API key from environment variables
// });

// app.post('/api/assistant', async (req, res) => {
//     try {
//         const { question } = req.body;

//         if (!question || question.trim().length === 0) {
//             return res.status(400).json({ error: 'Question cannot be empty.' });
//         }

//         // Call OpenAI's API to get the response
//         const completion = await openai.chat.completions.create({
//             model: 'gpt-3.5', // You can change this to GPT-4 if you want
//             messages: [{ role: 'user', content: question }],
//         });

//         const answer = completion.choices[0].message.content; // Extract the answer
//         res.json({ answer }); // Send the answer back to the frontend

//     } catch (error) {
//         console.error('Error communicating with OpenAI:', error);
//         res.status(500).json({
//             error: 'Failed to get a response from AI.',
//             details: error.message, // Provide error details for debugging
//         });
//     }
// });


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
app.use('/api/faqs', faqRoutes);
app.use('/api/product', productRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// app.use('/uploads', express.static('uploads'));
// connect to db
// console.log('MongoDB URI:', process.env.MONGO_URI);


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




