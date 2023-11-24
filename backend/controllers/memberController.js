const Member = require('../models/memberModel')
const mongoose = require('mongoose')
const multer = require('multer');
const fs = require('fs');
const path = require('path');




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


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Check if the 'images' directory exists, create it if not
        fs.mkdir('./images/', (err) => {
            cb(null, 'images');
        });
    },
    filename: function (req, file, cb) {
        console.log(file)
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    },
});

const upload = multer({ storage: storage });


// const createMember = async (req, res) => {
//     const { name, arabicName, email, faculty, type, committee, img, phone, linkedIn, memberId } = req.body

//     try {
//         const member = await Member.create({ name, arabicName, email, faculty, type, committee, img, phone, linkedIn, memberId })
//         res.status(200).json(member)
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

const createMember = async (req, res) => {
    const { name, arabicName, email, faculty, type, committee, phone, linkedIn, memberId } = req.body;
    try {
        // Use upload.single to handle single-file uploads
        upload.single('file')(req, res, async function (err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            // Make sure that req.file is available before using it
            if (!req.file) {
                return res.status(400).json({ error: 'Image file is required.' });
            }

            const member = await Member.create({
                name: req.body.name,
                arabicName: req.body.arabicName,
                email: req.body.email,
                faculty: req.body.faculty,
                type: req.body.type,
                committee: req.body.committee,
                img: req.file.filename,  // Use req.file to access the uploaded file
                phone: req.body.phone,
                linkedIn: req.body.linkedIn,
                memberId: req.body.memberId,
            });

            res.status(200).json(member);
        });
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