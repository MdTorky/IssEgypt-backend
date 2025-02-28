const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productsSchema = new Schema({

    pTitle: {
        type: String,
        required: true,
    },
    pArabicTitle: {
        type: String,
        required: true,
    },
    pDescription: {
        type: String,
        required: true,
    },
    pArabicDescription: {
        type: String,
        required: true,
    },
    pPrice: {
        type: Number,
    },
    pCategory: {
        type: [String],
        required: true
    },
    pImage: {
        type: String,
        required: true,
    },
    pFrontImage: {
        type: String,
        required: true,
    },
    pStatus: {
        type: String,
        required: true,
    },
    pModel: {
        type: String,
    }
}, { timestamps: true })

module.exports = mongoose.model("Product", productsSchema)

