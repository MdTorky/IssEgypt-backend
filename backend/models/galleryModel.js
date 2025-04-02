const mongoose = require('mongoose')

const Schema = mongoose.Schema

const gallerySchema = new Schema({
    folderName: {
        type: String,
        required: true
    },
    arabicFolderName: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    folderLink: {
        type: String,
        required: true
    },
    driveLink: {
        type: String,
    },
    folderImage: {
        type: String,
        required: true
    },
    session: {
        type: String,
        required: true
    },
    time: {
        type: Number,
    },
    committee: {
        type: String,
    }

}, { timestamps: true })

module.exports = mongoose.model('Gallery', gallerySchema)