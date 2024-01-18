const mongoose = require('mongoose')

const Schema = mongoose.Schema

const formSchema = new Schema({
    eventName: {
        type: String,
        // required: true
    },
    arabicEventName: {
        type: String,
        // required: true
    },
    eventImg: {
        type: String,
        required: true
    },
    eventDescription: {
        type: String,
        // required: true
    },
    sheetLink: {
        type: String,
        // required: true
    },
    type: {
        type: String,
        // required: true
    },
    inputs: {
        type: [String],
    },
    // name: {
    //     type: Boolean,
    // },
    // matric: {
    //     type: Boolean,
    // },
    // phone: {
    //     type: Boolean,
    // },
    // email: {
    //     type: Boolean,
    // },
    // faculty: {
    //     type: Boolean,
    // },
    // year: {
    //     type: Boolean,
    // },
    // semester: {
    //     type: Boolean,
    // },
    groupLink: {
        type: String,
    },
}, { timestamps: true })

module.exports = mongoose.model('Form', formSchema)