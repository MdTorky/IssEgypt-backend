const express = require("express")
const {
    createQuiz,
    getQuizByCode,
    joinQuiz,
    startQuiz,
    submitAnswer,
    nextQuestion,
    getCurrentQuestion,
    getQuizResults,
    getAllQuizzes,
    editPoints,
} = require("../controllers/welcomeController")

const router = express.Router()

// Quiz routes
router.post("/create", createQuiz)
router.get("/code/:code", getQuizByCode)
router.post("/join", joinQuiz)
router.put("/start/:code", startQuiz)
router.post("/answer", submitAnswer)
router.put("/next/:code", nextQuestion)
router.get("/question/:code", getCurrentQuestion)
router.get("/results/:code", getQuizResults)
router.get("/", getAllQuizzes)
router.put("/edit-points/:code", editPoints)

module.exports = router

