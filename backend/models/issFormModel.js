const mongoose = require('mongoose')

const Schema = mongoose.Schema

const issFormSchema = new Schema({
    type: {
        type: String,
    },
    eventName: {
        type: String,
    },
    eventID: {
        type: String,
    },
    fullName: {
        type: String,
    },
    matric: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    faculty: {
        type: String,
    },
    year: {
        type: Number,
    },
    semester: {
        type: String,
    },
    proof: {
        type: String,
    },
    customInputs: [{
        type: String,
    }],
}, { timestamps: true })

module.exports = mongoose.model('ISSForm', issFormSchema)