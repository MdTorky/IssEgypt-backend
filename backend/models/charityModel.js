const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const linkSchema = new Schema({
    type: {
        type: String,
    },
    url: {
        type: String,
    }
});

const charitySchema = new Schema({
    faculty: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        // required: true
    },
    course: {
        type: String,
        required: true
    },
    advice: {
        type: String,
        required: true
    },
    links: [linkSchema],
    industrial: {
        type: String,
    },
    file: {
        type: String,
    },
    name: {
        type: String,
    },
    condition: {
        type: String,
    },
    status: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Charity', charitySchema);
