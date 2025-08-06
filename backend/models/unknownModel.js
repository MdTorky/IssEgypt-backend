// // models/Unknown.js
const mongoose = require('mongoose');

// const UnknownSchema = new mongoose.Schema({
//     question: String,
//     date: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('Unknown', UnknownSchema);


// Enhanced Unknown Model
const UnknownSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        index: true
    },
    userSession: {
        type: String,
        index: true
    },
    ipAddress: String,
    userAgent: String,
    context: String, // Previous conversation context
    frequency: {
        type: Number,
        default: 1
    },
    isResolved: {
        type: Boolean,
        default: false
    },
    resolvedBy: String,
    resolvedAt: Date,
    suggestedAnswer: String,
    category: {
        type: String,
        enum: ['general', 'admission', 'courses', 'events', 'contact', 'about', 'facilities', 'other'],
        default: 'other'
    },
    priority: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    }
}, {
    timestamps: true
});

// Create text index for search
UnknownSchema.index({ question: 'text' });

// Group similar questions
UnknownSchema.statics.findSimilar = function (question, threshold = 0.6) {
    // This would use the similarity algorithm from the controller
    // For now, we'll do a simple text search
    return this.find({
        $text: { $search: question }
    });
};

module.exports = mongoose.model('Unknown', UnknownSchema);