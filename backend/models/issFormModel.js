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
    picture: {
        type: String,
    },
    proof: {
        type: String,
    },
    customInputs: [{
        type: String,
    }],
    selectInputs: {
        type: Map, // Or an object to store { label: selectedValue(s) }
        of: [String], // Array to handle multi-select
    },
}, { timestamps: true })

module.exports = mongoose.model('ISSForm', issFormSchema)