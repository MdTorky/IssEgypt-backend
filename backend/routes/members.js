const express = require('express')
const Member = require('../models/memberModel')
const cors = require('cors');

const {
    createMember,
    getMembers,
    getMember,
    deleteMember,
    updateMember
} = require('../controllers/memberController')

const router = express.Router()


router.use(cors());

// GET all workouts
router.get('/', getMembers)

// GET a single workout
router.get('/:id', getMember)

// POST a new workout
router.post('/', createMember)

// DELETE a workout
router.delete('/:id', deleteMember)

// UPDATE a workout
router.patch('/:id', updateMember)

module.exports = router