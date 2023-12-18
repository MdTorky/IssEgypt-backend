const Intern = require('../models/internshipModel')
const mongoose = require('mongoose')





const getInterns = async (req, res) => {
    const forms = await Intern.find({}).sort({ createdAt: -1 })
    res.status(200).json(forms)
}




const getIntern = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Form" })
    }
    const form = await Intern.findById(id)

    if (!form) {
        return res.status(404).json({ error: "No Such Form" })
    }

    res.status(200).json(form)

}




const createIntern = async (req, res) => {
    const { name, email, img, faculty, website, applyEmail, apply } = req.body

    try {
        const form = await Intern.create({ name, email, img, faculty, website, applyEmail, apply })
        res.status(200).json(form)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}




const deleteIntern = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Form" })
    }


    const form = await Intern.findOneAndDelete({ _id: id })
    if (!form) {
        return res.status(404).json({ error: "No Such Form" })
    }
    res.status(200).json(form)
}




const updateIntern = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Form" })
    }

    const form = await Intern.findOneAndUpdate({ _id: id }, {
        ...req.body
    })
    if (!form) {
        return res.status(404).json({ error: "No Such Form" })
    }
    res.status(200).json(form)

}


module.exports = {
    createIntern,
    getInterns,
    getIntern,
    deleteIntern,
    updateIntern
}