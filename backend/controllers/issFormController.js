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


const getFormByLink = async (req, res) => {
    const { link } = req.params;

    try {
        const form = await ISSForms.findOne({ link: link }); // Search by formLink instead of _id

        if (!form) {
            return res.status(404).json({ error: "No Such Form" });
        }

        res.status(200).json(form);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};



const createForm = async (req, res) => {
    const { type, link, eventName, eventID, fullName, matric, email, phone, faculty, year, semester, picture, proof, customInputs, selectInputs } = req.body

    try {
        const form = await ISSForms.create({ type, link, eventName, eventID, fullName, matric, email, phone, faculty, year, semester, picture, proof, customInputs, selectInputs })
        res.status(200).json(form)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}



const deleteForm = async (req, res) => {
    const { id } = req.params

    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //     return res.status(404).json({ error: "No Such Form" })
    // }


    // const form = await ISSForms.findOneAndDelete({ eventId: id })
    // if (!form) {
    //     return res.status(404).json({ error: "No Such Form" })
    // }
    // res.status(200).json(form)

    try {
        // Find the form by ID
        // const form = await ISSForms.findById(id);
        // if (!form) {
        //     return res.status(404).json({ error: "No Such Form" });
        // }

        // Delete responses associated with the ISSForm's eventId
        const form = await ISSForms.deleteMany({ eventID: id });

        // Delete the ISSForm
        // await ISSForms.findByIdAndDelete(id);

        res.status(200).json(form);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

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
    updateForm,
    getFormByLink
}