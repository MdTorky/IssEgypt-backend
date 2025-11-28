const Gallery = require('../models/galleryModel')
const mongoose = require('mongoose')
const dotenv = require("dotenv");
dotenv.config();


const { uploadFileToDrive } = require('../utilities/googleDrive');

const uploadToDrive = async (req, res) => {
    try {
        const folderId = req.body.folderId;
        if (!folderId) return res.status(400).json({ error: 'Folder ID is required' });

        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        const driveData = await uploadFileToDrive(file, folderId);

        res.status(200).json({
            fileId: driveData.id,
            webViewLink: driveData.webViewLink,
        });
    } catch (err) {
        console.error('Drive Upload Error:', err.message);
        res.status(500).json({ error: err.message });
    }
}




const getForms = async (req, res) => {
    const forms = await Gallery.find({}).sort({ createdAt: -1 })
    res.status(200).json(forms)
}




const getForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Gallery" })
    }
    const form = await Gallery.findById(id)

    if (!form) {
        return res.status(404).json({ error: "No Such Gallery" })
    }

    res.status(200).json(form)

}



const updateAllSessions = async (req, res) => {
    try {
        const result = await Gallery.updateMany(
            {}, // Empty filter means update all documents
            { $set: { session: "2024" } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: 'All transactions updated successfully' });
        } else {
            res.status(404).json({ error: 'No transactions found to update' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


const createForm = async (req, res) => {
    const { folderName, arabicFolderName, folderLink, folderImage, driveLink, icon, time, session, committee } = req.body

    try {
        const form = await Gallery.create({ folderName, arabicFolderName, folderLink, driveLink, folderImage, icon, time, session, committee })
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


    const form = await Gallery.findOneAndDelete({ _id: id })
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

    const form = await Gallery.findOneAndUpdate({ _id: id }, {
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
    updateForm,
    updateAllSessions,
    uploadToDrive,
}