const Faculty = require('../models/facultyModel')
const mongoose = require('mongoose')
const dotenv = require("dotenv");
dotenv.config();



const getForms = async (req, res) => {
    const forms = await Faculty.find({}).sort({ createdAt: -1 })
    res.status(200).json(forms)
}




const getForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Faculty" })
    }
    const form = await Faculty.findById(id)

    if (!form) {
        return res.status(404).json({ error: "No Such Faculty" })
    }

    res.status(200).json(form)

}




const createForm = async (req, res) => {
    const { facultyName, facultyId } = req.body

    try {
        const form = await Faculty.create({ facultyName, facultyId })
        res.status(200).json(form)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}



const deleteForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Faculty" })
    }


    const form = await Faculty.findOneAndDelete({ _id: id })
    if (!form) {
        return res.status(404).json({ error: "No Such Faculty" })
    }
    res.status(200).json(form)
}




const updateForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Faculty" })
    }

    const form = await Faculty.findOneAndUpdate({ _id: id }, {
        ...req.body
    })
    if (!form) {
        return res.status(404).json({ error: "No Such Faculty" })
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