const mongoose = require('mongoose')

const Schema = mongoose.Schema

const formSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    matric: {
        type: String,
        required: true
    },
    faculty: {
        type: String,
        required: true
    },
    suggestion: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Form', formSchema)