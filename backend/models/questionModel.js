const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    answer: { type: String, required: true },
    points: { type: Number, required: true },
    publicDate: { type: Date, required: true }, // When the question is made public
});

const Question = mongoose.model('Questions', questionSchema);
module.exports = Question;
