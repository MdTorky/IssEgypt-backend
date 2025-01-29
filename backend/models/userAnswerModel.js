const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userAnswerSchema = new Schema({
    fullName: { type: String, required: true },
    matricNumber: { type: String, required: true },
    email: { type: String, required: true },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Questions', required: true },
        answer: { type: String, required: true },
        points: { type: Number, default: 0 }, // Each answer's points
    }],
    submittedOn: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('UserAnswers', userAnswerSchema);