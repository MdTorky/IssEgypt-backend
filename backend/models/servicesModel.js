const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const serviceSchema = new Schema({
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
        required: true
    },
    aDescription: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    card: {
        type: String,
        required: true
    },
    status: {
        type: String,
    },
    groups: [
        {
            name: { type: String, required: true },  // Group name in English
            aName: { type: String, required: true } // Group name in Arabic
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
