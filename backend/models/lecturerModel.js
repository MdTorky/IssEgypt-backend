const mongoose = require('mongoose')

const Schema = mongoose.Schema

const lecturerSchema = new Schema({
    lecturerName: {
        type: String,
        required: true,
        unique: true
    },
    lecturerPhone: {
        type: String,
        required: true
    },
    lecturerEmail: {
        type: String,
    },
    lecturerFaculty: {
        type: String,
    },
    lecturerImage: {
        type: String,
    },
    lecturerJob: {
        type: String,
    },
    lecturerOffice: {
        type: String,
    }
}, { timestamps: true })

module.exports = mongoose.model('Lecturer', lecturerSchema)