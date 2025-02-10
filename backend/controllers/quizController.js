const Questions = require('../models/questionModel')
const UserAnswers = require('../models/userAnswerModel')
const mongoose = require('mongoose')
// const { compareAnswers } = require('./utils');


const addQuestion = async (req, res) => {
    const { questions } = req.body; // Array of questions
    try {
        // Ensure all questions are saved at once
        await Questions.insertMany(questions);
        res.status(201).json({ message: 'Questions added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const getUserAnswersByDate = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date is required.' });
        }

        const questions = await Questions.find({ publicDate: new Date(date) });

        if (!questions.length) {
            return res.status(404).json({ error: 'No questions found for the selected date.' });
        }

        const userAnswers = await UserAnswers.find({
            'answers.questionId': { $in: questions.map((q) => q._id) },
        }).populate({
            path: 'answers.questionId',
            select: 'questionText answer points',
        });

        const userData = userAnswers.map((userAnswer) => ({
            _id: userAnswer._id,
            matric: userAnswer.matricNumber,
            name: userAnswer.fullName,
            points: userAnswer.answers.reduce((total, ans) => total + (ans.points || 0), 0),
            answers: userAnswer.answers.map((ans) => ({
                questionId: ans.questionId._id,
                question: ans.questionId.questionText,
                qAnswer: ans.questionId.answer,
                qPoints: ans.questionId.points,
                answer: ans.answer,
                points: ans.points,
            })),
        }));

        // console.log(JSON.stringify(userData, null, 2)); // Debug log
        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user answers by date:', error);
        res.status(500).json({ error: 'An error occurred while fetching user data.' });
    }
};



const updateUserPoints = async (req, res) => {
    try {
        const { userId, answers } = req.body;

        if (!userId || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const userAnswer = await UserAnswers.findOne({ _id: userId });

        if (!userAnswer) {
            return res.status(404).json({ error: 'User not found' });
        }

        answers.forEach(({ questionId, points }) => {
            const answer = userAnswer.answers.find(
                (ans) => ans.questionId.toString() === questionId
            );
            if (answer) {
                answer.points = points;
            }
        });

        await userAnswer.save();
        res.status(200).json({ message: 'Points updated successfully' });
    } catch (error) {
        console.error('Error updating points:', error);
        res.status(500).json({ error: 'An error occurred while updating points' });
    }
};




const getContestantData = async (req, res) => {
    try {
        const aggregatedData = await UserAnswers.aggregate([
            {
                $unwind: "$answers",
                // Deconstruct the answers array
            },
            {
                $group: {
                    _id: "$matricNumber", // Group by matricNumber
                    totalPoints: { $sum: "$answers.points" }, // Sum up all points for the user
                    fullName: { $first: "$fullName" }, // Optionally pick one fullName
                    email: { $first: "$email" },
                    submittedOn: { $first: "$submittedOn" },// Optionally pick one email

                },
            },
            {
                $project: {
                    _id: 0, // Exclude the default _id field
                    matricNumber: "$_id",
                    totalPoints: 1,
                    fullName: 1,
                    email: 1,
                    submittedOn: 1,
                },
            },
        ]);
        res.status(200).json(aggregatedData);
    } catch (err) {
        console.error("Error fetching aggregated user data:", err);
        res.status(500).json({ message: "Server error" });
    }
};


const getContestantDataByDate = async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
    }

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire day of endDate

        const answers = await UserAnswers.aggregate([
            {
                $match: {
                    submittedOn: {
                        $gte: start,
                        $lte: end,
                    },
                },
            },
            {
                $unwind: '$answers', // Flatten the answers array
            },
            {
                $group: {
                    _id: '$matricNumber',
                    totalPoints: { $sum: '$answers.points' },
                    fullName: { $first: '$fullName' },
                    email: { $first: "$email" },
                    answers: { $push: '$answers' } // Push all answers into an array
                },
            },
            {
                $sort: { totalPoints: -1 },
            },
        ]);

        res.json(answers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching data' });
    }
}



// Fetch questions by date range
const questionsByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Validate query parameters
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required.' });
        }

        // Query the database for questions within the date range
        const questions = await Questions.find({
            publicDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
        });

        // Return the filtered questions
        res.status(200).json(questions);
    } catch (error) {
        console.error('Error fetching questions by date:', error);
        res.status(500).json({ error: 'An error occurred while fetching questions by date.' });
    }
};




// const getQuestions = async (req, res) => {
//     try {
//         const today = new Date();
//         const questions = await Questions.find({
//             publicDate: {
//                 $gte: new Date(today.setHours(0, 0, 0, 0)), // Start of today
//                 $lt: new Date(today.setHours(23, 59, 59, 999)) // End of today
//             }
//         });
//         if (questions.length === 0) {
//             return res.status(404).json({ message: 'No questions found for today.' });
//         }
//         res.status(200).json(questions);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

const getQuestions = async (req, res) => {
    try {
        // Set the current time to Malaysia time (UTC+8)
        const malaysiaTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" });
        const today = new Date(malaysiaTime);

        // Define the start and end of the day in Malaysian time
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // 00:00 MYT
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // 23:59 MYT

        // Query for questions with publicDate within Malaysia's day
        const questions = await Questions.find({
            publicDate: { $gte: startOfDay, $lt: endOfDay }
        });

        if (questions.length === 0) {
            return res.status(404).json({ message: 'No questions found for today in Malaysia time.' });
        }

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const getAllQuestions = async (req, res) => {
    try {
        const questions = await Questions.find(); // Fetch all questions without filtering by date
        if (questions.length === 0) {
            return res.status(404).json({ message: 'No questions found.' });
        }
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};






// const postAnswers = async (req, res) => {
//     try {
//         const { fullName, matricNumber, email, answers } = req.body;

//         // Get the current date and set the time to 00:00:00 (start of the day)
//         const startOfDay = new Date();
//         startOfDay.setHours(0, 0, 0, 0);

//         // Get the end of the day (23:59:59.999)
//         const endOfDay = new Date(startOfDay);
//         endOfDay.setHours(23, 59, 59, 999);

//         // Check if the user has already submitted today
//         const existingSubmission = await UserAnswers.findOne({
//             matricNumber,
//             submittedOn: { $gte: startOfDay, $lte: endOfDay }
//         });

//         if (existingSubmission) {
//             return res.status(400).json({ message: "You have already submitted answers today." });
//         }

//         // Process answers
//         for (const ans of answers) {
//             const question = await Questions.findById(ans.questionId);

//             if (question) {
//                 // Check if the user's answer matches semantically
//                 const isCorrect = await LanguageProcessor.compareAnswers(question.answer, ans.answer);

//                 // Assign points based on correctness
//                 ans.points = isCorrect ? (question.points || 0) : 0;
//             }
//         }

//         // Create a new user answer entry with updated answers
//         const newSubmission = new UserAnswers({
//             fullName,
//             matricNumber,
//             email,
//             answers,
//         });

//         await newSubmission.save();
//         return res.status(200).json({ message: "Answers submitted successfully" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error" });
//     }
// };









const postAnswers = async (req, res) => {
    try {
        const { fullName, matricNumber, email, answers } = req.body;

        // Get the current date and set the time to 00:00:00 (start of the day)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Get the end of the day (23:59:59.999)
        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999);

        // Check if the user has already submitted today
        const existingSubmission = await UserAnswers.findOne({
            matricNumber,
            submittedOn: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingSubmission) {
            return res.status(400).json({ message: "You have already submitted answers today." });
        }

        // Loop through the answers and check each answer
        for (const ans of answers) {
            const question = await Questions.findById(ans.questionId);

            if (question) {
                // Check if the user's answer is correct
                if (ans.answer === question.answer) {
                    // If correct, update points for this specific answer
                    ans.points = question.points || 0;
                } else {
                    // If incorrect, set points to 0
                    ans.points = 0;
                }
            }
        }

        const newSubmission = new UserAnswers({
            fullName,
            matricNumber,
            email,
            answers,
        });

        await newSubmission.save();
        return res.status(200).json({ message: "Answers submitted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};







module.exports = {
    addQuestion,
    getContestantData,
    postAnswers,
    getQuestions,
    getAllQuestions,
    getContestantDataByDate,
    questionsByDate,
    getUserAnswersByDate,
    updateUserPoints
    // getFirstProductByUserId
}




