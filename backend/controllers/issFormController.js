const ISSForms = require('../models/issFormModel')
const mongoose = require('mongoose')
const dotenv = require("dotenv");
dotenv.config();



const getForms = async (req, res) => {
    const forms = await ISSForms.find({}).sort({ createdAt: -1 })
    res.status(200).json(forms)
}




const getForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Form" })
    }
    const form = await ISSForms.findById(id)

    if (!form) {
        return res.status(404).json({ error: "No Such Form" })
    }

    res.status(200).json(form)

}



const createForm = async (req, res) => {
    const { type, eventName, eventID, fullName, matric, email, phone, faculty, year, semester, proof, customInputs } = req.body

    try {
        const form = await ISSForms.create({ type, eventName, eventID, fullName, matric, email, phone, faculty, year, semester, proof, customInputs })
        res.status(200).json(form)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}



const deleteForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Form" })
    }


    const form = await ISSForms.findOneAndDelete({ _id: id })
    if (!form) {
        return res.status(404).json({ error: "No Such Form" })
    }
    res.status(200).json(form)
}




const updateForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Form" })
    }

    const form = await ISSForms.findOneAndUpdate({ _id: id }, {
        ...req.body
    })
    if (!form) {
        return res.status(404).json({ error: "No Such Form" })
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