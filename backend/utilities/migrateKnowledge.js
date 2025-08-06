// --- START OF FILE migrateKnowledge.js ---
const mongoose = require('mongoose');
const EmbeddingService = require('../controllers/EmbeddingService.js'); // Adjust path if needed

// IMPORTANT: Define schemas for OLD and NEW knowledge
const OldKnowledgeSchema = new mongoose.Schema({
    question: String,
    answer: String,
    arabicQuestion: String,
    arabicAnswer: String,
    category: String,
    priority: Number,
    isActive: Boolean,
    keywords: [String]
});

const NewKnowledgeSchema = new mongoose.Schema({
    text: { type: String, required: true },
    answer: { type: String, required: true },
    language: { type: String, enum: ['en', 'ar'], required: true, index: true },
    embedding: { type: [Number] },
    category: String,
    priority: Number,
    isActive: Boolean,
    keywords: [String]
}, { timestamps: true });

// NOTE: Use a NEW collection name to avoid conflicts during migration.
// You can rename it back to 'knowledges' later if you wish.
const OldKnowledge = mongoose.model('Knowledge', OldKnowledgeSchema);
const NewKnowledge = mongoose.model('Knowledge_V2', NewKnowledgeSchema);


console.log(process.env.MONGO_URI)

// --- Main Migration Logic ---
async function migrate() {
    console.log("Connecting to MongoDB...");
    // Replace with your actual MongoDB connection string
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log("MongoDB connected.");

    console.log("Initializing Embedding Service...");
    const embeddingService = await EmbeddingService.getInstance();
    console.log("Embedding Service ready.");

    console.log("Fetching old knowledge documents...");
    const oldDocs = await OldKnowledge.find({});
    console.log(`Found ${oldDocs.length} documents to migrate.`);

    for (const oldDoc of oldDocs) {
        // --- Process English Version ---
        if (oldDoc.question && oldDoc.answer) {
            const englishText = `${oldDoc.question} ${oldDoc.answer}`;
            console.log(`- Generating embedding for (EN): "${oldDoc.question}"`);
            const englishEmbedding = await embeddingService.getEmbedding(englishText);

            const newEnglishDoc = new NewKnowledge({
                text: oldDoc.question,
                answer: oldDoc.answer,
                language: 'en',
                embedding: englishEmbedding,
                category: oldDoc.category,
                priority: oldDoc.priority,
                isActive: oldDoc.isActive,
                keywords: oldDoc.keywords
            });
            await newEnglishDoc.save();
            console.log(`  > Saved English version.`);
        }

        // --- Process Arabic Version ---
        if (oldDoc.arabicQuestion && oldDoc.arabicAnswer) {
            const arabicText = `${oldDoc.arabicQuestion} ${oldDoc.arabicAnswer}`;
            console.log(`- Generating embedding for (AR): "${oldDoc.arabicQuestion}"`);
            const arabicEmbedding = await embeddingService.getEmbedding(arabicText);

            const newArabicDoc = new NewKnowledge({
                text: oldDoc.arabicQuestion,
                answer: oldDoc.arabicAnswer,
                language: 'ar',
                embedding: arabicEmbedding,
                category: oldDoc.category,
                priority: oldDoc.priority,
                isActive: oldDoc.isActive,
                keywords: oldDoc.keywords // You might want to use arabicKeywords here if you have them
            });
            await newArabicDoc.save();
            console.log(`  > Saved Arabic version.`);
        }
    }

    console.log("\nMigration complete!");
    await mongoose.disconnect();
}

migrate().catch(err => {
    console.error("Migration failed:", err);
    mongoose.disconnect();
});
// --- END OF FILE migrateKnowledge.js ---