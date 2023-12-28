const mongoose = require('mongoose')

const Schema = mongoose.Schema

const internSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    img: {
        type: String,
    },
    faculty: {
        type: String,
        required: true
    },
    website: {
        type: String,
    },
    applyEmail: {
        type: String,
    },
    apply: {
        type: String,
    },
    categories: {
        type: [String],
    },
    location: {
        type: [String],
    }
}, { timestamps: true })

module.exports = mongoose.model('Internships', internSchema)