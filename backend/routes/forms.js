const express = require('express')
const Form = require('../models/formModel')
const {
    createForm,
    getForms,
    getForm,
    deleteForm,
    updateForm,
    getFormByLink
} = require('../controllers/formController')
const requireAuth = require('../middleware/requireAuth')
const router = express.Router()


// router.use(requireAuth)

// GET all workouts
router.get('/', getForms)

// GET a single workout
router.get('/:id', getForm)
router.get('/link/:link', getFormByLink)

// POST a new workout
// router.post('/', parser.single("image"), createForm)
router.post('/', createForm)


// DELETE a workout
router.delete('/:id', deleteForm)

// UPDATE a workout
router.patch('/:id', updateForm)

module.exports = router