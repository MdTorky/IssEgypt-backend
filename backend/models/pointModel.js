const mongoose = require('mongoose')

const Schema = mongoose.Schema

const pointSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    matric: {
        type: String,
        required: true,
        unique: true
    },
    points: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
    },
    status: {
        type: Boolean,
        required: true
    },
}, { timestamps: true })

module.exports = mongoose.model('Point', pointSchema)