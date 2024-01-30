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
    eventImg: {
        type: String,
        required: true
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
}, { timestamps: true })

module.exports = mongoose.model('Form', formSchema)