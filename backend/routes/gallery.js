const express = require('express')
const upload = require('../middleware/uplaod');
const {
    createForm,
    getForms,
    getForm,
    deleteForm,
    updateForm,
    updateAllSessions,
    uploadToDrive,
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

router.post('/upload', upload.single('image'), uploadToDrive);


module.exports = router