const Member = require('../models/memberModel')
const mongoose = require('mongoose')
const multer = require('multer');
const fs = require('fs');
const path = require('path');
import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const getMembers = async (req, res) => {
    const members = await Member.find({}).sort({ createdAt: -1 })
    res.status(200).json(members)
}




const getMember = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Member" })
    }
    const member = await Member.findById(id)

    if (!member) {
        return res.status(404).json({ error: "No Such Member" })
    }

    res.status(200).json(member)

}


// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {

//         const dir = './uploads/';
//         if (!fs.existsSync(dir)) {
//             fs.mkdirSync(dir, { recursive: true });
//         }
//         cb(null, dir);
//     },
//     filename: function (req, file, cb) {
//         console.log(file);
//         cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
//     },
// });


const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', // Optional, specify a folder to organize uploads
        format: async (req, file) => 'png', // Format of the image uploaded to Cloudinary
        public_id: (req, file) => 'uploads', // Unique name for the uploaded file
    },
});


// const createMember = async (req, res) => {
//     const { name, arabicName, email, faculty, type, committee, img, phone, linkedIn, memberId } = req.body

//     try {
//         const member = await Member.create({ name, arabicName, email, faculty, type, committee, img, phone, linkedIn, memberId })
//         res.status(200).json(member)
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

// const createMember = async (req, res) => {
//     const { name, arabicName, email, faculty, type, committee, phone, linkedIn, memberId } = req.body;
//     try {
//         upload.single('file')(req, res, async function (err) {
//             if (err) {
//                 return res.status(400).json({ error: err.message });
//             }

//             if (!req.file) {
//                 return res.status(400).json({ error: 'Image file is required.' });
//             }

//             const member = await Member.create({
//                 name: req.body.name,
//                 arabicName: req.body.arabicName,
//                 email: req.body.email,
//                 faculty: req.body.faculty,
//                 type: req.body.type,
//                 committee: req.body.committee,
//                 img: req.file.filename, 
//                 phone: req.body.phone,
//                 linkedIn: req.body.linkedIn,
//                 memberId: req.body.memberId,
//             });

//             res.status(200).json(member);
//         });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };


const createMember = async (req, res) => {
    const {
        name,
        arabicName,
        email,
        faculty,
        type,
        committee,
        phone,
        linkedIn,
        memberId,
    } = req.body;

    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        const member = await Member.create({
            name,
            arabicName,
            email,
            faculty,
            type,
            committee,
            img: result.secure_url,
            phone,
            linkedIn,
            memberId,
        });

        // Remove the temporary file after upload
        fs.unlinkSync(req.file.path);

        res.status(200).json(member);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



const deleteMember = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Member" })
    }


    const member = await Member.findOneAndDelete({ _id: id })
    if (!member) {
        return res.status(404).json({ error: "No Such Member" })
    }
    res.status(200).json(member)
}




const updateMember = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Member" })
    }

    const member = await Member.findOneAndUpdate({ _id: id }, {
        ...req.body
    })
    if (!member) {
        return res.status(404).json({ error: "No Such Member" })
    }
    res.status(200).json(member)

}


module.exports = {
    createMember,
    getMembers,
    getMember,
    deleteMember,
    updateMember
}