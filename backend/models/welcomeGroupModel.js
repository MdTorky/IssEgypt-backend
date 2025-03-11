const mongoose = require("mongoose")

const answerSchema = new mongoose.Schema({
    questionIndex: {
        type: Number,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    isCorrect: {
        type: Boolean,
        default: false,
    },
    timeTaken: {
        type: Number, // Time taken in milliseconds
    },
    points: {
        type: Number,
        default: 0,
    },
})

const welcomeGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WelcomeQuiz",
        required: true,
    },
    groupCode: {
        type: String,
        required: true,
        unique: true,
    },
    answers: [answerSchema],
    totalPoints: {
        type: Number,
        default: 0,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("WelcomeGroup", welcomeGroupSchema)

