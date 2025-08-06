const express = require('express')
const Knowledge = require('../models/knowledgeModel')
const {
    getAll,
    getItem,
    createKnowledge,
    handleChatRequest,
    getAnalytics,
    updateKnowledge, // 1. Import the new functions
    deleteKnowledge
} = require('../controllers/knowledgeController')
const router = express.Router()



// GET all workouts
router.get('/', getAll)

// GET a single workout
router.get('/analytics', getAnalytics);
router.get('/:id', getItem)

// POST a new workout
router.post('/createKnowledge', createKnowledge)

router.patch('/:id', updateKnowledge); 

router.delete('/:id', deleteKnowledge); 

router.post('/chat', handleChatRequest);



module.exports = router