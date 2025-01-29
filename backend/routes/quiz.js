const express = require('express');
const {
    addQuestion,
    getContestantData,
    postAnswers,
    getQuestions,
    getAllQuestions,
    getContestantDataByDate,
    questionsByDate,
    getUserAnswersByDate,
    updateUserPoints
} = require("../controllers/quizController")

const router = express.Router()


// require auth for all routes


// add Question
router.post('/questions', addQuestion)


// Get all Users
router.get('/contestants', getContestantData)
router.get('/quiz', getQuestions)
router.get('/questions', getAllQuestions);
router.get('/contestantsbydate', getContestantDataByDate);
router.get('/questionsbydate', questionsByDate);
router.get('/answers', getUserAnswersByDate);
router.post('/updatepoints', updateUserPoints);

//Submit Answers
router.post('/submit', postAnswers)


module.exports = router