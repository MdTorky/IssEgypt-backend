const Form = require('../models/formModel')
const mongoose = require('mongoose')
const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");
const streamifier = require("streamifier");
const multer = require("multer");
const fs = require('fs');
dotenv.config();



const getForms = async (req, res) => {
    const forms = await Form.find({}).sort({ createdAt: -1 })
    res.status(200).json(forms)
}




const getForm = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such Form" })
    }
    const form = await Form.findById(id)

    if (!form) {
        return res.status(404).json({ error: "No Such Form" })
    }

    res.status(200).json(form)

}




// const createForm = async (req, res) => {
//     const { name, email, matric, faculty, suggestion } = req.body

//     try {
//         const form = await Form.create({ name, email, matric, faculty, suggestion })
//         res.status(200).json(form)
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }



// const storage = multer.memoryStorage();
// const upload = multer({ storage });
const upload = multer({ storage: multer.memoryStorage() }).single('file');

// const createForm = async (req, res) => {
//     const { eventName, arabicEventName, eventImg, eventDescription, sheetLink, type, inputs, groupLink } = req.body

//     try {
//         const form = await Form.create({ eventName, arabicEventName, eventImg, eventDescription, sheetLink, type, inputs, groupLink })
//         res.status(200).json(form)
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }



// const createForm = async (req, res) => {
//     const {
//         eventName,
//         arabicEventName,
//         eventDescription,
//         sheetLink,
//         type,
//         inputs,
//         groupLink,
//     } = req.body;

//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: "Please upload an image." });
//         }

//         const stream = await cloudinary.uploader.upload_stream(
//             {
//                 folder: "demo",
//             },
//             (error, result) => {
//                 if (error) {
//                     return res.status(500).json({ error: "Error uploading image." });
//                 }
//                 const form = Form.create({
//                     eventName,
//                     arabicEventName,
//                     eventImg: result.secure_url,
//                     eventDescription,
//                     sheetLink,
//                     type,
//                     inputs,
//                     groupLink,
//                 });
//                 res.status(200).json(form);
//             }
//         );
//         streamifier.createReadStream(req.file.buffer).pipe(stream);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };


// const createForm = async (req, res) => {
//     upload(req, res, async (err) => {
//         const {
//             eventName,
//             arabicEventName,
//             eventDescription,
//             sheetLink,
//             type,
//             inputs,
//             groupLink,
//         } = req.body;

//         try {
//             if (!req.file) {
//                 return res.status(400).json({ error: "Please upload an image." });
//             }

//             const result = await cloudinary.uploader.upload(req.file.path, {
//                 folder: "demo",
//             });

//             const form = await Form.create({
//                 eventName,
//                 arabicEventName,
//                 eventImg: result.secure_url,
//                 eventDescription,
//                 sheetLink,
//                 type,
//                 inputs,
//                 groupLink,
//             });

//             fs.unlinkSync(req.file.path);

//             res.status(200).json(form);
//         } catch (error) {
//             res.status(400).json({ error: error.message });
//         }
//     });
// };


// const createForm = async (req, res) => {

//     const form = await Form.create({
//         eventName,
//         arabicEventName,
//         eventImg: req.secure_url,
//         eventDescription,
//         sheetLink,
//         type,
//         inputs,
//         groupLink,
//     });


//     try {
//         await form.save();
//     } catch (error) {
//         return res.status(400).json({
//             message: `image upload failed ${error}`,
//             status: "error"
//         })
//     }


// };


// const createForm = async (req, res) => {
//     const {
//         eventName,
//         arabicEventName,
//         eventDescription,
//         sheetLink,
//         type,
//         inputs,
//         groupLink,
//     } = req.body;

//     const form = new Form({
//         eventName,
//         arabicEventName,
//         eventImg: req.file.path,
//         eventDescription,
//         sheetLink,
//         type,
//         inputs,
//         groupLink,
//     });

//     try {
//         await form.save();
//         res.status(200).json(form);
//     } catch (error) {
//         console.error("Error saving form:", error);
//         return res.status(500).json({
//             message: "Internal Server Error",
//             status: "error",
//             error: error.message,
//             stack: error.stack,
//         });
//     }
// };




// const createForm = async (req, res, next) => {
//     const { imgUrl } = req.body;

//     if (!imgUrl) {
//         res.status(400);
//         return next(new Error("imgUrl fields are required"));
//     }

//     try {
//         const upload = await Form.create({
//             imgUrl,
//         });

//         res.status(201).json({
//             success: true,
//             upload,
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500);
//         next(error);
//     }
// }


const createForm = async (req, res) => {
    const { eventImg } = req.body

    try {
        const form = await Form.create({ eventImg })
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


    const form = await Form.findOneAndDelete({ _id: id })
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

    const form = await Form.findOneAndUpdate({ _id: id }, {
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