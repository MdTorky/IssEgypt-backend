const mongoose = require('mongoose')

const Schema = mongoose.Schema

const bookingSchema = new Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book"
    },
    reserverName: {
        type: String,
        required: true
    },
    reserverEmail: {
        type: String,
        required: true
    },
    reserverMatric: {
        type: String,
        required: true
    },
    reserverPhone: {
        type: String,
        required: true
    },
    reserverFaculty: {
        type: String,
        required: true
    },
    reserverPassword: {
        type: String,
    },
    reserverDate: {
        type: Date,
    },
    reserverStatus: {
        type: String,
    }

}, { timestamps: true })

module.exports = mongoose.model('Booking', bookingSchema)