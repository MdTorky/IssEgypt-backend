const Point = require('../models/pointModel')
const mongoose = require('mongoose')
const dotenv = require("dotenv");
dotenv.config();



const getForms = async (req, res) => {
    const forms = await Point.find({}).sort({ createdAt: -1 })
    res.status(200).json(forms)
}




const getForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Point" })
    }
    const form = await Point.findById(id)

    if (!form) {
        return res.status(404).json({ error: "No Such Point" })
    }

    res.status(200).json(form)

}




const createForm = async (req, res) => {
    const { name, matric, points, phone, status } = req.body;

    try {
        // Check if matric already exists
        const matricExists = await Point.findOne({ matric });
        if (matricExists) {
            throw new Error('Matric already exists');
        }

        // Create a new Point document with the extracted properties
        const form = await Point.create({ name, matric, points, phone, status });

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
        return res.status(404).json({ error: "No Such Point" })
    }


    const form = await Point.findOneAndDelete({ _id: id })
    if (!form) {
        return res.status(404).json({ error: "No Such Point" })
    }
    res.status(200).json(form)
}




const updateForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Point" })
    }

    const form = await Point.findOneAndUpdate({ _id: id }, {
        ...req.body
    })
    if (!form) {
        return res.status(404).json({ error: "No Such Point" })
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