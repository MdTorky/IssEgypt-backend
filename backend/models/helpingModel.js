const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const linkSchema = new Schema({
    type: {
        type: String,
    },
    aType: {
        type: String,
    },
    url: {
        type: String,
    }
});

const helpingHandSchema = new Schema({
    service: {
        type: String,
        required: true
    },
    group: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    aName: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    aDescription: {
        type: String,
    },
    img: {
        type: String,
        required: true
    },
    links: [linkSchema],
    status: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('HelpingHand', helpingHandSchema);
