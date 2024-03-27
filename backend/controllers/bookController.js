const Book = require('../models/bookModel')
const mongoose = require('mongoose')
const dotenv = require("dotenv");
dotenv.config();



const getForms = async (req, res) => {
    const forms = await Book.find({}).sort({ createdAt: -1 })
    res.status(200).json(forms)
}




const getForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Book" })
    }
    const form = await Book.findById(id)

    if (!form) {
        return res.status(404).json({ error: "No Such Book" })
    }

    res.status(200).json(form)

}




const createForm = async (req, res) => {
    const { bookName, bookImage, bookFaculty, bookStatus } = req.body;

    try {
        // Create a new Book document with the extracted properties
        const form = await Book.create({ bookName, bookImage, bookFaculty, bookStatus });

        // Respond with the created form
        res.status(200).json(form);
    } catch (error) {
        // Handle errors
        console.error('Error creating form:', error);
        res.status(400).json({ error: error.message });
    }
}


const deleteForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Book" })
    }


    const form = await Book.findOneAndDelete({ _id: id })
    if (!form) {
        return res.status(404).json({ error: "No Such Book" })
    }
    res.status(200).json(form)
}




const updateForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Book" })
    }

    const form = await Book.findOneAndUpdate({ _id: id }, {
        ...req.body
    })
    if (!form) {
        return res.status(404).json({ error: "No Such Book" })
    }
    res.status(200).json(form)

}


module.exports = {
    createForm,
    getForms,
    getForm,
    deleteForm,
    updateForm
}