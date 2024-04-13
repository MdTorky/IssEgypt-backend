const express = require('express')
const Booking = require('../models/bookingModel')
const {
    createForm,
    getForms,
    getForm,
    deleteForm,
    updateForm,
    sendMessage
} = require('../controllers/bookingController')
const router = express.Router()



// GET all workouts
router.get('/', getForms)
router.post('/sendMessage/testing', sendMessage)

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