const express = require('express')
const Member = require('../models/memberModel')
const {
    createMember,
    getMembers,
    getMember,
    deleteMember,
    updateMember
} = require('../controllers/memberController')

const router = express.Router()

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