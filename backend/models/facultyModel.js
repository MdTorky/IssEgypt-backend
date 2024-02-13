const mongoose = require('mongoose')

const Schema = mongoose.Schema

const facultySchema = new Schema({
    facultyName: {
        type: String,
        required: true
    },
    facultyId: {
        type: String,
        required: true
    }

}, { timestamps: true })

module.exports = mongoose.model('Faculty', facultySchema)