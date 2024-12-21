const FAQ = require('../models/FAQModel');
const mongoose = require('mongoose');

// Get all FAQs
const getFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find({}).sort({ createdAt: -1 });
        res.status(200).json(faqs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single FAQ by ID
const getFAQ = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such FAQ" });
    }

    try {
        const faq = await FAQ.findById(id);
        if (!faq) {
            return res.status(404).json({ error: "No Such FAQ" });
        }
        res.status(200).json(faq);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new FAQ
const createFAQ = async (req, res) => {
    const { question, answer, language, link } = req.body;

    try {
        const faq = await FAQ.create({ question, answer, language, link });
        res.status(201).json(faq);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete an FAQ by ID
const deleteFAQ = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such FAQ" });
    }

    try {
        const faq = await FAQ.findOneAndDelete({ _id: id });
        if (!faq) {
            return res.status(404).json({ error: "No Such FAQ" });
        }
        res.status(200).json({ message: "FAQ deleted successfully", faq });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an FAQ by ID
const updateFAQ = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No Such FAQ" });
    }

    try {
        const faq = await FAQ.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });
        if (!faq) {
            return res.status(404).json({ error: "No Such FAQ" });
        }
        res.status(200).json(faq);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getFAQs,
    getFAQ,
    createFAQ,
    deleteFAQ,
    updateFAQ,
};
