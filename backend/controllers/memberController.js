const Member = require('../models/memberModel')
const mongoose = require('mongoose')
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cloudinary = require("../utilities/cloudinary");



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
//         const dir = './uploads';
//         if (!fs.existsSync(dir)) {
//             fs.mkdirSync(dir, { recursive: true });
//         }
//         cb(null, dir);
//     },
//     filename: function (req, file, cb) {
//         cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
//     },
// });

// const upload = multer({
//     storage: storage,
// });




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
//         res.status(500).json({ error: error.message });
//     }
// };

const createForm = async (req, res) => {
    const { name, arabicName, email, faculty, type, committee, img, phone, linkedIn, memberId } = req.body;

    try {
        const form = await Member.create({ name, arabicName, email, faculty, type, committee, img, phone, linkedIn, memberId });
        res.status(200).json(form);
    } catch (error) {
        // Handle errors
        console.error('Error creating form:', error);
        res.status(400).json({ error: error.message });
    }
}










// CLOUDINARY


// const storage = multer.diskStorage({
//     filename: function (req, file, cb) {
//         cb(null, file.originalname)
//     }
// });

// const upload = multer({ storage: storage });






// const createMember = async (req, res) => {
//     const { name, arabicName, email, faculty, type, committee, phone, linkedIn, memberId } = req.body;

//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: 'Image file is required.' });
//         }

//         cloudinary.uploader.upload(req.file.path, async function (err, result) {
//             if (err) {
//                 console.log(err);
//                 return res.status(500).json({
//                     success: false,
//                     message: "Error"
//                 });
//             }

//             const member = await Member.create({
//                 name,
//                 arabicName,
//                 email,
//                 faculty,
//                 type,
//                 committee,
//                 img: result.secure_url,
//                 phone,
//                 linkedIn,
//                 memberId,
//             });

//             res.status(200).json({
//                 success: true,
//                 message: "Uploaded!",
//                 data: member
//             });
//         });
//     } catch (error) {
//         console.error('Error creating member:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };











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