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


const getFormsByEventId = async (req, res) => {
    const { eventID } = req.params; // Extract eventID from params

    try {
        // Find all forms with the matching eventID
        const forms = await ISSForms.find({ eventID: eventID });

        if (forms.length === 0) {
            return res.status(404).json({ error: "No Forms Found for This Event ID" });
        }

        res.status(200).json(forms);
    } catch (error) {
        res.status(500).json({ error: "Server Error", details: error.message });
    }
};



const createForm = async (req, res) => {
    const { type, eventName, eventID, fullName, matric, email, phone, faculty, year, semester, picture, proof, customInputs, selectInputs } = req.body

    try {
        const form = await ISSForms.create({ type, eventName, eventID, fullName, matric, email, phone, faculty, year, semester, picture, proof, customInputs, selectInputs })
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
    getFormsByEventId
}