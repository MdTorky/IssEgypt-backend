const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  language: { type: String, required: true },
  link: { type: String }
});

// Add text index for search capability
faqSchema.index({ question: 'text' });

module.exports = mongoose.model('FAQ', faqSchema);
