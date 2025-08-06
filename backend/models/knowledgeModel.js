


// const mongoose = require('mongoose');

// const KnowledgeSchema = new mongoose.Schema({
//   question: {
//     type: String,
//     required: true,
//     index: true,
//     trim: true
//   },
//   answer: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   keywords: [{
//     type: String,
//     index: true,
//     lowercase: true,
//     trim: true
//   }],
//   category: {
//     type: String,
//     enum: ['general', 'services', 'admission', 'courses', 'events', 'contact', 'about', 'facilities', 'board', 'leadership', 'academic', 'other'],
//     default: 'other',
//     index: true
//   },
//   priority: {
//     type: Number,
//     default: 1,
//     min: 1,
//     max: 10,
//     index: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true,
//     index: true
//   },
//   usageCount: {
//     type: Number,
//     default: 0,
//     index: true
//   },
//   lastUsed: {
//     type: Date,
//     default: Date.now,
//     index: true
//   },
//   createdBy: {
//     type: String,
//     default: 'system'
//   },
//   updatedBy: {
//     type: String,
//     default: 'system'
//   },
//   // Enhanced fields for better AI support
//   language: {
//     type: String,
//     enum: ['english', 'arabic', 'both'],
//     default: 'english',
//     index: true
//   },
//   arabicQuestion: {
//     type: String,
//     trim: true,
//     sparse: true // Only index non-null values
//   },
//   arabicAnswer: {
//     type: String,
//     trim: true,
//     sparse: true
//   },
//   arabicKeywords: [{
//     type: String,
//     trim: true
//   }],
//   entities: [{
//     type: String,
//     enum: ['person', 'organization', 'service', 'location', 'event', 'role', 'other'],
//     index: true
//   }],
//   relatedTopics: [{
//     type: String,
//     index: true
//   }],
//   contextType: {
//     type: String,
//     enum: ['factual', 'procedural', 'contact', 'navigation', 'description', 'other'],
//     default: 'factual',
//     index: true
//   },
//   difficulty: {
//     type: String,
//     enum: ['basic', 'intermediate', 'advanced'],
//     default: 'basic'
//   },
//   tags: [{
//     type: String,
//     lowercase: true,
//     trim: true,
//     index: true
//   }],
//   // Learning and improvement fields
//   successRate: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 1
//   },
//   feedbackScore: {
//     type: Number,
//     default: 0
//   },
//   lastImprovement: {
//     type: Date,
//     default: Date.now
//   },
//   improvementNotes: [{
//     note: String,
//     date: { type: Date, default: Date.now },
//     source: { type: String, enum: ['user', 'ai', 'admin'], default: 'ai' }
//   }],
//   // Semantic search support
//   embedding: {
//     type: [Number],
//     select: false // Don't include in normal queries
//   },
//   semanticKeywords: [{
//     type: String,
//     index: true
//   }],
//   // Multi-language support
//   translations: [{
//     language: String,
//     question: String,
//     answer: String,
//     keywords: [String]
//   }]
// }, {
//   timestamps: true
// });

// // Enhanced text indexes for better search
// KnowledgeSchema.index({
//   question: 'text',
//   answer: 'text',
//   keywords: 'text',
//   arabicQuestion: 'text',
//   arabicAnswer: 'text',
//   arabicKeywords: 'text'

// }, {
//   default_language: "none",
//   weights: {
//     question: 10,
//     arabicQuestion: 10,
//     keywords: 8,
//     arabicKeywords: 8,
//     answer: 5,
//     arabicAnswer: 5
//   },
//   name: 'knowledge_text_index'
// });

// // Compound indexes for better performance
// KnowledgeSchema.index({ category: 1, priority: -1, isActive: 1 });
// KnowledgeSchema.index({ isActive: 1, usageCount: -1 });
// KnowledgeSchema.index({ language: 1, category: 1 });
// KnowledgeSchema.index({ entities: 1, contextType: 1 });
// KnowledgeSchema.index({ tags: 1, isActive: 1 });

// // Instance methods
// KnowledgeSchema.methods.incrementUsage = function () {
//   this.usageCount += 1;
//   this.lastUsed = new Date();
//   return this.save();
// };

// KnowledgeSchema.methods.updateSuccessRate = function (wasSuccessful) {
//   const currentRate = this.successRate || 0;
//   const currentCount = this.usageCount || 1;

//   if (wasSuccessful) {
//     this.successRate = (currentRate * (currentCount - 1) + 1) / currentCount;
//   } else {
//     this.successRate = (currentRate * (currentCount - 1)) / currentCount;
//   }

//   return this.save();
// };

// KnowledgeSchema.methods.addImprovement = function (note, source = 'ai') {
//   this.improvementNotes.push({
//     note,
//     source,
//     date: new Date()
//   });
//   this.lastImprovement = new Date();
//   return this.save();
// };

// KnowledgeSchema.methods.addTranslation = function (language, question, answer, keywords = []) {
//   // Remove existing translation for this language
//   this.translations = this.translations.filter(t => t.language !== language);

//   // Add new translation
//   this.translations.push({
//     language,
//     question,
//     answer,
//     keywords
//   });

//   return this.save();
// };

// KnowledgeSchema.methods.getTranslation = function (language) {
//   return this.translations.find(t => t.language === language);
// };

// KnowledgeSchema.methods.hasTranslation = function (language) {
//   return this.translations.some(t => t.language === language);
// };

// // Static methods for advanced queries
// KnowledgeSchema.statics.findByCategory = function (category, isActive = true) {
//   return this.find({ category, isActive }).sort({ priority: -1, usageCount: -1 });
// };

// KnowledgeSchema.statics.findByLanguage = function (language, isActive = true) {
//   return this.find({ language, isActive }).sort({ priority: -1 });
// };

// KnowledgeSchema.statics.findByEntity = function (entity, isActive = true) {
//   return this.find({ entities: entity, isActive }).sort({ priority: -1 });
// };

// KnowledgeSchema.statics.findPopular = function (limit = 10, isActive = true) {
//   return this.find({ isActive })
//     .sort({ usageCount: -1, priority: -1 })
//     .limit(limit);
// };

// KnowledgeSchema.statics.findRecent = function (limit = 10, isActive = true) {
//   return this.find({ isActive })
//     .sort({ lastUsed: -1 })
//     .limit(limit);
// };

// KnowledgeSchema.statics.findBySuccessRate = function (minRate = 0.5, isActive = true) {
//   return this.find({
//     successRate: { $gte: minRate },
//     isActive
//   }).sort({ successRate: -1, usageCount: -1 });
// };

// KnowledgeSchema.statics.searchText = function (query, options = {}) {
//   const {
//     category = null,
//     language = null,
//     limit = 20,
//     minScore = 0.1
//   } = options;

//   let filter = {
//     $text: { $search: query },
//     isActive: true
//   };

//   if (category) filter.category = category;
//   if (language) filter.language = language;

//   return this.find(filter, {
//     score: { $meta: 'textScore' }
//   })
//     .where('score', { $gte: minScore })
//     .sort({ score: { $meta: 'textScore' }, priority: -1 })
//     .limit(limit);
// };

// KnowledgeSchema.statics.findSimilar = function (keywords, excludeId = null, limit = 5) {
//   let filter = {
//     $or: [
//       { keywords: { $in: keywords } },
//       { arabicKeywords: { $in: keywords } },
//       { semanticKeywords: { $in: keywords } }
//     ],
//     isActive: true
//   };

//   if (excludeId) {
//     filter._id = { $ne: excludeId };
//   }

//   return this.find(filter)
//     .sort({ priority: -1, usageCount: -1 })
//     .limit(limit);
// };

// KnowledgeSchema.statics.getAnalytics = function () {
//   return this.aggregate([
//     { $match: { isActive: true } },
//     {
//       $group: {
//         _id: '$category',
//         count: { $sum: 1 },
//         avgPriority: { $avg: '$priority' },
//         totalUsage: { $sum: '$usageCount' },
//         avgSuccessRate: { $avg: '$successRate' }
//       }
//     },
//     { $sort: { count: -1 } }
//   ]);
// };

// // Pre-save middleware for automatic enhancements



// KnowledgeSchema.pre('save', function (next) {
//   // Detect language if not set
//   if (!this.language || this.language === 'english') {
//     if (this.arabicQuestion || this.arabicAnswer) {
//       this.language = 'both';
//     } else if (/[\u0600-\u06FF]/.test(this.question || '') || /[\u0600-\u06FF]/.test(this.answer || '')) {
//       this.language = 'arabic';
//     }
//   }

//   // Auto-extract entities
//   if (this.isModified('question') || this.isModified('answer')) {
//     this.entities = this.extractEntities();
//   }

//   // Auto-generate semantic keywords
//   if (this.isModified('question') || this.isModified('answer') || this.isModified('keywords')) {
//     this.semanticKeywords = this.generateSemanticKeywords();
//   }

//   next();
// });

// // Helper methods
// KnowledgeSchema.methods.containsArabic = function (text) {
//   return /[\u0600-\u06FF]/.test(text);
// };

// KnowledgeSchema.methods.extractEntities = function () {
//   const entities = [];
//   const combinedText = `${this.question} ${this.answer}`.toLowerCase();

//   // Person entities
//   if (combinedText.includes('president') || combinedText.includes('رئيس')) {
//     entities.push('person', 'role');
//   }

//   // Organization entities
//   if (combinedText.includes('iss egypt') || combinedText.includes('utm')) {
//     entities.push('organization');
//   }

//   // Service entities
//   if (combinedText.includes('service') || combinedText.includes('خدمة')) {
//     entities.push('service');
//   }

//   // Location entities
//   if (combinedText.includes('location') || combinedText.includes('address')) {
//     entities.push('location');
//   }

//   // Event entities
//   if (combinedText.includes('event') || combinedText.includes('فعالية')) {
//     entities.push('event');
//   }

//   return [...new Set(entities)];
// };

// KnowledgeSchema.methods.generateSemanticKeywords = function () {
//   const keywords = [];
//   const allKeywords = [
//     ...(this.keywords || []),
//     ...(this.arabicKeywords || [])
//   ];

//   // Add semantic variations
//   allKeywords.forEach(keyword => {
//     keywords.push(keyword);

//     // Add common variations
//     if (keyword === 'president') {
//       keywords.push('leader', 'head', 'chief', 'رئيس');
//     } else if (keyword === 'contact') {
//       keywords.push('reach', 'call', 'email', 'تواصل');
//     } else if (keyword === 'service') {
//       keywords.push('help', 'assistance', 'خدمة', 'مساعدة');
//     }
//   });

//   return [...new Set(keywords)];
// };

// // Post-save middleware for learning
// KnowledgeSchema.post('save', function (doc) {
//   // Log significant changes for learning purposes
//   if (doc.isModified('usageCount') && doc.usageCount > 0) {
//     console.log(`Knowledge "${doc.question}" was used. Total usage: ${doc.usageCount}`);
//   }
// });

// // Virtual for combined keywords
// KnowledgeSchema.virtual('allKeywords').get(function () {
//   return [
//     ...(this.keywords || []),
//     ...(this.arabicKeywords || []),
//     ...(this.semanticKeywords || [])
//   ];
// });

// // Virtual for display question (with language preference)
// KnowledgeSchema.virtual('displayQuestion').get(function () {
//   return this.arabicQuestion || this.question;
// });

// // Virtual for display answer (with language preference)
// KnowledgeSchema.virtual('displayAnswer').get(function () {
//   return this.arabicAnswer || this.answer;
// });

// // Ensure virtuals are included in JSON
// KnowledgeSchema.set('toJSON', { virtuals: true });

// module.exports = mongoose.model('Knowledge', KnowledgeSchema);




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