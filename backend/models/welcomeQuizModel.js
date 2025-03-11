const mongoose = require("mongoose")

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

// Remove or comment out the pre-save hook since we're now generating the code in the controller
// welcomeQuizSchema.pre('save', async function(next) {
//   if (!this.code) {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let code = '';
//     for (let i = 0; i < 6; i++) {
//       code += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     this.code = code;
//   }
//   next();
// });

module.exports = mongoose.model("WelcomeQuiz", welcomeQuizSchema)

