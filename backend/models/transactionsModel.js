const mongoose = require('mongoose')

const Schema = mongoose.Schema

const transactionsSchema = new Schema({


    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    buyerName: {
        type: String,
        required: true
    },
    buyerMatric: {
        type: String,
        required: true
    },
    buyerEmail: {
        type: String,
        required: true
    },
    buyerPhone: {
        type: String,
        required: true
    },
    buyerFaculty: {
        type: String,
        required: true
    },
    buyerAddress: {
        type: String,
        required: true
    },
    productQuantity: {
        type: Number,
        required: true
    },
    productSize: {
        type: String,
    },
    referenceNumber: {
        type: String,
        unique: true
    },
    transactionStatus: {
        type: String,
        required: true
    },
    proof: {
        type: String,
        required: true
    },
}, { timestamps: true })


module.exports = mongoose.model("Transactions", transactionsSchema)