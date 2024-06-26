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
    folderImage: {
        type: String,
        required: true
    },
    time: {
        type: Number,
    }

}, { timestamps: true })

module.exports = mongoose.model('Gallery', gallerySchema)