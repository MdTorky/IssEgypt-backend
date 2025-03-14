const express = require('express')
const Form = require('../models/issFormModel')
const {
    createForm,
    getForms,
    getForm,
    deleteForm,
    updateForm,
    getFormsByEventId
} = require('../controllers/issFormController')
const router = express.Router()


// GET all workouts
router.get('/', getForms)

// GET a single workout
router.get('/:id', getForm)
router.get('/events/:eventID', getFormsByEventId)

// POST a new workout
// router.post('/', parser.single("image"), createForm)
router.post('/', createForm)

// DELETE a workout
router.delete('/:id', deleteForm)

// UPDATE a workout
router.patch('/:id', updateForm)

module.exports = router