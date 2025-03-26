const mongoose = require('mongoose')

const Schema = mongoose.Schema

const formSchema = new Schema({
    eventName: {
        type: String,
        required: true
    },
    arabicEventName: {
        type: String,
        required: true
    },
    link: {
        type: String,
        unique: true
    },
    eventImg: {
        type: String,
        // required: true
    },
    eventDescription: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    inputs: {
        type: [String],
    },
    customInputs: [{
        type: String,
    }],
    selectInputs: [{
        label: String,
        options: [String],
        isMultiSelect: Boolean
    }],
    groupLink: {
        type: String,
    },
    paymentQR: {
        type: String,
    },
    paymentAmount: {
        type: Number,
    },
    status: {
        type: Boolean,
    },
    limit: {
        type: Number,
    },
    sendEmail: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Form', formSchema)