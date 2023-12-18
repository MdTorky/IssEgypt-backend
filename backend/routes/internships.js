const express = require('express')
const Intern = require('../models/internshipModel')
const {
    createIntern,
    getInterns,
    getIntern,
    deleteIntern,
    updateIntern
} = require('../controllers/internshipController')

const router = express.Router()

// GET all workouts
router.get('/', getInterns)

// GET a single workout
router.get('/:id', getIntern)

// POST a new workout
router.post('/', createIntern)

// DELETE a workout
router.delete('/:id', deleteIntern)

// UPDATE a workout
router.patch('/:id', updateIntern)

module.exports = router