






const mongoose = require('mongoose');

const KnowledgeSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },

  language: {
    type: String,
    enum: ['en', 'ar'],
    required: true,
    index: true
  },
  keywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  embedding: {
    type: [Number],
    select: false
  },
  category: {
    type: String,
    default: 'other'
  },
  priority: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  usageCount: {
    type: Number,
    default: 0,
    index: true
  },
  lastUsed: {
    type: Date,
    default: Date.now,
    index: true
  },
}, {
  timestamps: true
});

KnowledgeSchema.index({
  text: 'text',
  keywords: 'text'
}, {
  weights: {
    text: 10,
    keywords: 5
  },
  name: 'knowledge_text_index',
  default_language: "none"
});

KnowledgeSchema.index({ isActive: 1, category: 1 });

module.exports = mongoose.model('Knowledge', KnowledgeSchema);