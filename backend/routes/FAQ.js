const express = require('express');
const {
    getFAQs,
    getFAQ,
    createFAQ,
    deleteFAQ,
    updateFAQ,
} = require('../controllers/FAQController');
const router = express.Router();

// GET all FAQs
router.get('/', getFAQs);

// GET a single FAQ
router.get('/:id', getFAQ);

// POST a new FAQ
router.post('/', createFAQ);

// DELETE a FAQ
router.delete('/:id', deleteFAQ);

// UPDATE a FAQ
router.patch('/:id', updateFAQ);

module.exports = router;
