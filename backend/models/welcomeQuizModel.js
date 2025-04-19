const mongoose = require("mongoose")

const optionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        enum: ["red", "blue", "yellow", "green"],
        required: true,
    }
})

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    correctAnswer: {
        type: String,
        required: true,
    },
    timeLimit: {
        type: Number,
        default: 60, // 1 minute in seconds
    },
    questionType: {
        type: String,
        enum: ["open", "multiple_choice"],
        default: "open"
    },
    options: [optionSchema]
})

const welcomeQuizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    questions: [questionSchema],
    isActive: {
        type: Boolean,
        default: false,
    },
    currentQuestion: {
        type: Number,
        default: -1, // -1 means not started
    },
    startTime: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("WelcomeQuiz", welcomeQuizSchema)