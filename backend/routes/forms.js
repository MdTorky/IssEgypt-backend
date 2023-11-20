const express = require('express')
const Form = require('../models/formModel')
const {
    createForm,
    getForms,
    getForm,
    deleteForm,
    updateForm
} = require('../controllers/formController')

const router = express.Router()

// GET all workouts
router.get('/', getForms)

// GET a single workout
router.get('/:id', getForm)

// POST a new workout
router.post('/', createForm)

// DELETE a workout
router.delete('/:id', deleteForm)

// UPDATE a workout
router.patch('/:id', updateForm)

module.exports = router