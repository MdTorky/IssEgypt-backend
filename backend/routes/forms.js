const express = require('express')
const Form = require('../models/formModel')
const {
    createForm,
    getForms,
    getForm,
    deleteForm,
    updateForm
} = require('../controllers/formController')
const parser = require("../middleware/cloudinary.config");
const router = express.Router()

const ImageUploadRouter = require("express").Router();

// GET all workouts
router.get('/', getForms)

// GET a single workout
router.get('/:id', getForm)

// POST a new workout
// router.post('/', parser.single("image"), createForm)
router.post('/', createForm)

// DELETE a workout
router.delete('/:id', deleteForm)

// UPDATE a workout
router.patch('/:id', updateForm)

module.exports = router