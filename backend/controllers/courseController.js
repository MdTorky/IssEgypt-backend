const Course = require('../models/courseModel')
const mongoose = require('mongoose')
const dotenv = require("dotenv");
dotenv.config();



const getForms = async (req, res) => {
    const forms = await Course.find({}).sort({ createdAt: -1 })
    res.status(200).json(forms)
}




const getForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Course" })
    }
    const form = await Course.findById(id)

    if (!form) {
        return res.status(404).json({ error: "No Such Course" })
    }

    res.status(200).json(form)

}




const createForm = async (req, res) => {
    const { courseName, facultyId, semester } = req.body


    try {
        const form = await Course.create({ courseName, facultyId, semester })
        res.status(200).json(form)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}



const deleteForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Course" })
    }


    const form = await Course.findOneAndDelete({ _id: id })
    if (!form) {
        return res.status(404).json({ error: "No Such Course" })
    }
    res.status(200).json(form)
}




const updateForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Course" })
    }

    const form = await Course.findOneAndUpdate({ _id: id }, {
        ...req.body
    })
    if (!form) {
        return res.status(404).json({ error: "No Such Course" })
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