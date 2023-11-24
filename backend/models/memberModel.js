const mongoose = require('mongoose')

const Schema = mongoose.Schema

const memberSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    arabicName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    faculty: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    committee: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    linkedIn: {
        type: String,
        // required: true
    },
    memberId: {
        type: Number,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Member', memberSchema)