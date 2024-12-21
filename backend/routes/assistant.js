const express = require('express');
const router = express.Router();
const Question = require('../models/FAQModel');  // Model for storing questions and answers

// Simple algorithm to find the best match for the question
function getMatchingAnswer(userQuestion, storedQuestions) {
    const bestMatch = storedQuestions.reduce((best, current) => {
        const currentSimilarity = getCosineSimilarity(current.question, userQuestion);
        if (currentSimilarity > best.similarity) {
            return { question: current.question, answer: current.answer, similarity: currentSimilarity };
        }
        return best;
    }, { similarity: 0 });

    return bestMatch.answer || 'Sorry, I do not understand your question.';
}

// Cosine similarity placeholder function (to be improved)
function getCosineSimilarity(str1, str2) {
    // A simple string comparison for now, you can use advanced algorithms later
    return str1.toLowerCase() === str2.toLowerCase() ? 1 : 0;
}

// POST endpoint to get answer from stored questions
router.post('/ask', async (req, res) => {
    const { question, language } = req.body;

    // Fetch all questions of the specified language
    const storedQuestions = await Question.find({ language });

    // Get the best matching answer
    const answer = getMatchingAnswer(question, storedQuestions);

    res.json({ answer });
});

// POST endpoint to add a new question and answer to the database
router.post('/add', async (req, res) => {
    const { question, answer, language } = req.body;

    const newQuestion = new Question({ question, answer, language });
    await newQuestion.save();

    res.json({ message: 'Question added successfully!' });
});

module.exports = router;
