const express = require('express')
const {
    createForm,
    getForms,
    getForm,
    deleteForm,
    updateForm,
    updateAllSessions
} = require('../controllers/galleryController')
const router = express.Router()



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
router.patch('/session/update', updateAllSessions)

module.exports = router