const mongoose = require('mongoose')

const Schema = mongoose.Schema

const bookSchema = new Schema({
    bookName: {
        type: String,
        required: true,
        unique: true,
    },
    bookImage: {
        type: String,
        required: true
    },
    bookFaculty: {
        type: [String],
    },
    bookStatus: {
        type: String,
        required: true
    }

}, { timestamps: true })

module.exports = mongoose.model('Book', bookSchema)