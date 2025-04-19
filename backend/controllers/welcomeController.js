// const WelcomeQuiz = require("../models/welcomeQuizModel")
// const WelcomeGroup = require("../models/welcomeGroupModel")

// // Create a new quiz
// const createQuiz = async (req, res) => {
//     try {
//         const { title, description, questions } = req.body

//         // Generate a random 6-character code
//         const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
//         let code = ""
//         for (let i = 0; i < 6; i++) {
//             code += characters.charAt(Math.floor(Math.random() * characters.length))
//         }

//         const quiz = new WelcomeQuiz({
//             title,
//             description,
//             questions,
//             code, // Explicitly set the code
//         })

//         await quiz.save()
//         res.status(201).json(quiz)
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

// // Get quiz by code
// const getQuizByCode = async (req, res) => {
//     try {
//         const { code } = req.params
//         const quiz = await WelcomeQuiz.findOne({ code })
//         if (!quiz) {
//             return res.status(404).json({ error: "Quiz not found" })
//         }
//         res.status(200).json(quiz)
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

// // Join a quiz as a group
// const joinQuiz = async (req, res) => {
//     try {
//         const { code, groupName } = req.body
//         const quiz = await WelcomeQuiz.findOne({ code })

//         if (!quiz) {
//             return res.status(404).json({ error: "Quiz not found" })
//         }

//         if (quiz.isActive) {
//             return res.status(400).json({ error: "Quiz has already started" })
//         }

//         const group = new WelcomeGroup({
//             name: groupName,
//             quiz: quiz._id,
//         })

//         await group.save()
//         res.status(201).json(group)
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

// // Start a quiz
// const startQuiz = async (req, res) => {
//     try {
//         const { quizId } = req.params
//         const quiz = await WelcomeQuiz.findById(quizId)

//         if (!quiz) {
//             return res.status(404).json({ error: "Quiz not found" })
//         }

//         quiz.isActive = true
//         quiz.currentQuestion = 0
//         quiz.startTime = new Date()
//         await quiz.save()

//         res.status(200).json(quiz)
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

// // Submit an answer
// const submitAnswer = async (req, res) => {
//     try {
//         const { groupId, answer } = req.body
//         const group = await WelcomeGroup.findById(groupId)

//         if (!group) {
//             return res.status(404).json({ error: "Group not found" })
//         }

//         const quiz = await WelcomeQuiz.findById(group.quiz)

//         if (!quiz || !quiz.isActive) {
//             return res.status(400).json({ error: "Quiz is not active" })
//         }

//         const currentQuestionIndex = quiz.currentQuestion

//         if (currentQuestionIndex < 0 || currentQuestionIndex >= quiz.questions.length) {
//             return res.status(400).json({ error: "Invalid question index" })
//         }

//         // Check if answer already submitted for this question
//         const existingAnswer = group.answers.find((a) => a.questionIndex === currentQuestionIndex)
//         if (existingAnswer) {
//             return res.status(400).json({ error: "Answer already submitted for this question" })
//         }

//         const currentQuestion = quiz.questions[currentQuestionIndex]
//         const submittedAt = new Date()
//         const questionStartTime = new Date(quiz.startTime)
//         questionStartTime.setSeconds(questionStartTime.getSeconds() + currentQuestionIndex * currentQuestion.timeLimit)

//         // Calculate time taken in milliseconds
//         const timeTaken = submittedAt - questionStartTime

//         // Check if answer is correct
//         const isCorrect = answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase()

//         // Calculate points based on time taken (faster = more points)
//         // Maximum points is 1000, minimum is 100 for correct answers
//         let points = 0
//         if (isCorrect) {
//             const maxTime = currentQuestion.timeLimit * 1000 // Convert to milliseconds
//             points = Math.max(100, Math.floor(1000 - (timeTaken / maxTime) * 900))
//         }

//         // Create answer object
//         const answerObj = {
//             questionIndex: currentQuestionIndex,
//             answer,
//             submittedAt,
//             isCorrect,
//             timeTaken,
//             points,
//         }

//         // Add answer to group
//         group.answers.push(answerObj)
//         group.totalPoints += points
//         await group.save()

//         res.status(200).json({
//             success: true,
//             isCorrect,
//             points,
//             totalPoints: group.totalPoints,
//         })
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

// // Move to next question
// const nextQuestion = async (req, res) => {
//     try {
//         const { quizId } = req.params
//         const quiz = await WelcomeQuiz.findById(quizId)

//         if (!quiz) {
//             return res.status(404).json({ error: "Quiz not found" })
//         }

//         if (!quiz.isActive) {
//             return res.status(400).json({ error: "Quiz is not active" })
//         }

//         if (quiz.currentQuestion >= quiz.questions.length - 1) {
//             // End the quiz if all questions have been answered
//             quiz.isActive = false
//             await quiz.save()
//             return res.status(200).json({ message: "Quiz completed", quiz })
//         }

//         // Move to next question
//         quiz.currentQuestion += 1
//         await quiz.save()

//         res.status(200).json(quiz)
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

// // Get current question
// const getCurrentQuestion = async (req, res) => {
//     try {
//         const { quizId } = req.params
//         const quiz = await WelcomeQuiz.findById(quizId)

//         if (!quiz) {
//             return res.status(404).json({ error: "Quiz not found" })
//         }

//         if (!quiz.isActive) {
//             return res.status(400).json({ error: "Quiz is not active or has ended" })
//         }

//         const currentQuestionIndex = quiz.currentQuestion

//         if (currentQuestionIndex < 0 || currentQuestionIndex >= quiz.questions.length) {
//             return res.status(400).json({ error: "Invalid question index" })
//         }

//         const currentQuestion = quiz.questions[currentQuestionIndex]

//         // Don't send the correct answer to the client
//         const questionForClient = {
//             text: currentQuestion.text,
//             timeLimit: currentQuestion.timeLimit,
//             index: currentQuestionIndex,
//             total: quiz.questions.length,
//         }

//         res.status(200).json(questionForClient)
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

// // Get quiz results
// const getQuizResults = async (req, res) => {
//     try {
//         const { quizId } = req.params
//         const groups = await WelcomeGroup.find({ quiz: quizId }).sort({ totalPoints: -1 })

//         if (!groups.length) {
//             return res.status(404).json({ error: "No groups found for this quiz" })
//         }

//         res.status(200).json(groups)
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

// // Get all quizzes
// const getAllQuizzes = async (req, res) => {
//     try {
//         const quizzes = await WelcomeQuiz.find().sort({ createdAt: -1 })
//         res.status(200).json(quizzes)
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

// module.exports = {
//     createQuiz,
//     getQuizByCode,
//     joinQuiz,
//     startQuiz,
//     submitAnswer,
//     nextQuestion,
//     getCurrentQuestion,
//     getQuizResults,
//     getAllQuizzes,
// }




const WelcomeQuiz = require("../models/welcomeQuizModel")
const WelcomeGroup = require("../models/welcomeGroupModel")

// Create a new quiz
const createQuiz = async (req, res) => {
    try {
        const { title, description, questions } = req.body

        // Generate a random 6-character code
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        let code = ""
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length))
        }

        const quiz = new WelcomeQuiz({
            title,
            description,
            questions,
            code, // Explicitly set the code
        })

        await quiz.save()
        res.status(201).json(quiz)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Get quiz by code
const getQuizByCode = async (req, res) => {
    try {
        const { code } = req.params
        const quiz = await WelcomeQuiz.findOne({ code })
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" })
        }
        res.status(200).json(quiz)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Join a quiz as a group
const joinQuiz = async (req, res) => {
    try {
        const { code, groupName } = req.body
        const quiz = await WelcomeQuiz.findOne({ code })

        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" })
        }

        if (quiz.isActive) {
            return res.status(400).json({ error: "Quiz has already started" })
        }

        // Generate a unique group code
        const groupCode = generateUniqueGroupCode()

        const group = new WelcomeGroup({
            name: groupName,
            quiz: quiz._id,
            groupCode, // Add this line
        })

        await group.save()
        res.status(201).json({
            id: group._id,
            name: group.name,
            groupCode: group.groupCode,
            quizCode: quiz.code,
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Helper function to generate a unique group code
const generateUniqueGroupCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return code
}

// Start a quiz
const startQuiz = async (req, res) => {
    try {
        const { code } = req.params
        const quiz = await WelcomeQuiz.findOne({ code })

        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" })
        }

        quiz.isActive = true
        quiz.currentQuestion = 0
        quiz.startTime = new Date()
        await quiz.save()

        res.status(200).json(quiz)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Submit an answer
// const submitAnswer = async (req, res) => {
//     try {
//         const { groupId, answer } = req.body
//         const group = await WelcomeGroup.findById(groupId)

//         if (!group) {
//             return res.status(404).json({ error: "Group not found" })
//         }

//         const quiz = await WelcomeQuiz.findById(group.quiz)

//         if (!quiz || !quiz.isActive) {
//             return res.status(400).json({ error: "Quiz is not active" })
//         }

//         const currentQuestionIndex = quiz.currentQuestion

//         if (currentQuestionIndex < 0 || currentQuestionIndex >= quiz.questions.length) {
//             return res.status(400).json({ error: "Invalid question index" })
//         }

//         // Check if answer already submitted for this question
//         const existingAnswer = group.answers.find((a) => a.questionIndex === currentQuestionIndex)
//         if (existingAnswer) {
//             return res.status(400).json({ error: "Answer already submitted for this question" })
//         }

//         const currentQuestion = quiz.questions[currentQuestionIndex]
//         const submittedAt = new Date()
//         const questionStartTime = new Date(quiz.startTime)
//         questionStartTime.setSeconds(questionStartTime.getSeconds() + currentQuestionIndex * currentQuestion.timeLimit)

//         // Calculate time taken in milliseconds
//         const timeTaken = submittedAt - questionStartTime

//         // Check if answer is correct
//         const isCorrect = answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase()

//         // Calculate points based on time taken (faster = more points)
//         // Maximum points is 1000, minimum is 100 for correct answers
//         let points = 0
//         if (isCorrect) {
//             const maxTime = currentQuestion.timeLimit * 1000 // Convert to milliseconds
//             points = Math.max(100, Math.floor(1000 - (timeTaken / maxTime) * 900))
//         }

//         // Create answer object
//         const answerObj = {
//             questionIndex: currentQuestionIndex,
//             answer,
//             submittedAt,
//             isCorrect,
//             timeTaken,
//             points,
//         }

//         // Add answer to group
//         group.answers.push(answerObj)
//         group.totalPoints += points
//         await group.save()

//         res.status(200).json({
//             success: true,
//             isCorrect,
//             points,
//             totalPoints: group.totalPoints,
//         })
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }


const submitAnswer = async (req, res) => {
    try {
        const { groupId, answer } = req.body
        const group = await WelcomeGroup.findById(groupId)

        if (!group) {
            return res.status(404).json({ error: "Group not found" })
        }

        const quiz = await WelcomeQuiz.findById(group.quiz)

        if (!quiz || !quiz.isActive) {
            return res.status(400).json({ error: "Quiz is not active" })
        }

        const currentQuestionIndex = quiz.currentQuestion

        if (currentQuestionIndex < 0 || currentQuestionIndex >= quiz.questions.length) {
            return res.status(400).json({ error: "Invalid question index" })
        }

        // Check if answer already submitted for this question
        const existingAnswer = group.answers.find((a) => a.questionIndex === currentQuestionIndex)
        if (existingAnswer) {
            return res.status(400).json({ error: "Answer already submitted for this question" })
        }

        const currentQuestion = quiz.questions[currentQuestionIndex]
        const submittedAt = new Date()
        const questionStartTime = new Date(quiz.startTime)
        questionStartTime.setSeconds(questionStartTime.getSeconds() + currentQuestionIndex * currentQuestion.timeLimit)

        // Calculate time taken in milliseconds
        const timeTaken = submittedAt - questionStartTime

        // Check if answer is correct - handle both open-ended and multiple-choice questions
        let isCorrect = false

        if (currentQuestion.questionType === "open") {
            isCorrect = answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase()
        } else {
            // For multiple-choice, compare answer directly with correctAnswer
            isCorrect = answer === currentQuestion.correctAnswer
        }

        // Calculate points based on time taken (faster = more points)
        // Maximum points is 1000, minimum is 100 for correct answers
        let points = 0
        if (isCorrect) {
            const maxTime = currentQuestion.timeLimit * 1000 // Convert to milliseconds
            points = Math.max(100, Math.floor(1000 - (timeTaken / maxTime) * 900))
        }

        // Create answer object
        const answerObj = {
            questionIndex: currentQuestionIndex,
            answer,
            submittedAt,
            isCorrect,
            timeTaken,
            points,
        }

        // Add answer to group
        group.answers.push(answerObj)
        group.totalPoints += points
        await group.save()

        res.status(200).json({
            success: true,
            isCorrect,
            points,
            totalPoints: group.totalPoints,
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Move to next question
const nextQuestion = async (req, res) => {
    try {
        const { code } = req.params
        const quiz = await WelcomeQuiz.findOne({ code })

        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" })
        }

        if (!quiz.isActive) {
            return res.status(400).json({ error: "Quiz is not active" })
        }

        if (quiz.currentQuestion >= quiz.questions.length - 1) {
            // End the quiz if all questions have been answered
            quiz.isActive = false
            await quiz.save()
            return res.status(200).json({ message: "Quiz completed", quiz })
        }

        // Move to next question
        quiz.currentQuestion += 1
        await quiz.save()

        res.status(200).json(quiz)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Get current question
// const getCurrentQuestion = async (req, res) => {
//     try {
//         const { code } = req.params
//         const quiz = await WelcomeQuiz.findOne({ code })

//         if (!quiz) {
//             return res.status(404).json({ error: "Quiz not found" })
//         }

//         if (!quiz.isActive) {
//             return res.status(400).json({ error: "Quiz is not active or has ended" })
//         }

//         const currentQuestionIndex = quiz.currentQuestion

//         if (currentQuestionIndex < 0 || currentQuestionIndex >= quiz.questions.length) {
//             return res.status(400).json({ error: "Invalid question index" })
//         }

//         const currentQuestion = quiz.questions[currentQuestionIndex]

//         // Don't send the correct answer to the client
//         const questionForClient = {
//             text: currentQuestion.text,
//             timeLimit: currentQuestion.timeLimit,
//             index: currentQuestionIndex,
//             total: quiz.questions.length,
//         }

//         res.status(200).json(questionForClient)
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

const getCurrentQuestion = async (req, res) => {
    try {
        const { code } = req.params
        const quiz = await WelcomeQuiz.findOne({ code })

        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" })
        }

        if (!quiz.isActive) {
            return res.status(400).json({ error: "Quiz is not active or has ended" })
        }

        const currentQuestionIndex = quiz.currentQuestion

        if (currentQuestionIndex < 0 || currentQuestionIndex >= quiz.questions.length) {
            return res.status(400).json({ error: "Invalid question index" })
        }

        const currentQuestion = quiz.questions[currentQuestionIndex]

        // Create a response object based on question type
        let questionForClient = {
            text: currentQuestion.text,
            timeLimit: currentQuestion.timeLimit,
            index: currentQuestionIndex,
            total: quiz.questions.length,
            questionType: currentQuestion.questionType
        }

        // For multiple-choice questions, include options but without correctAnswer
        if (currentQuestion.questionType === "multiple_choice") {
            questionForClient.options = currentQuestion.options.map(option => ({
                text: option.text,
                color: option.color
            }))
        }

        res.status(200).json(questionForClient)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Get quiz results
const getQuizResults = async (req, res) => {
    try {
        const { code } = req.params
        const quiz = await WelcomeQuiz.findOne({ code })

        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" })
        }

        const groups = await WelcomeGroup.find({ quiz: quiz._id }).sort({ totalPoints: -1 })

        if (!groups.length) {
            return res.status(404).json({ error: "No groups found for this quiz" })
        }

        res.status(200).json(groups)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Get all quizzes
const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await WelcomeQuiz.find().sort({ createdAt: -1 })
        res.status(200).json(quizzes)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// Edit points
const editPoints = async (req, res) => {
    try {
        const { code } = req.params
        const { groups } = req.body

        const quiz = await WelcomeQuiz.findOne({ code })
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" })
        }

        for (const group of groups) {
            await WelcomeGroup.findByIdAndUpdate(group._id, {
                answers: group.answers,
                totalPoints: group.answers.reduce((sum, answer) => sum + (answer.points || 0), 0),
            })
        }

        res.status(200).json({ message: "Points updated successfully" })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
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
}


