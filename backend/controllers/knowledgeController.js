const Knowledge = require('../models/knowledgeModel')
const Unknown = require('../models/unknownModel');
const axios = require('axios');
const mongoose = require('mongoose')
const natural = require('natural'); // Free NLP library
const stopword = require('stopword');
const { newStemmer } = require('../middleware/Stemmer.js');
const EmbeddingService = require('./EmbeddingService.js');
class EnhancedSmartKnowledgeController {
    constructor() {
        this.embeddingService = null;
        this.tokenizer = new natural.WordTokenizer();

        // --- BIND ALL METHODS TO ENSURE 'this' IS ALWAYS CORRECT ---
        this.getEmbedding = this.getEmbedding.bind(this);
        this.containsArabic = this.containsArabic.bind(this);
        this.extractKeywords = this.extractKeywords.bind(this);
        this.findBestMatch = this.findBestMatch.bind(this);
        this.handleEnhancedChat = this.handleEnhancedChat.bind(this);
        this.createKnowledge = this.createKnowledge.bind(this);
        this.createKnowledgeAI = this.createKnowledgeAI.bind(this);
        this.updateKnowledge = this.updateKnowledge.bind(this);
        this.deleteKnowledge = this.deleteKnowledge.bind(this);
        this.getAnalytics = this.getAnalytics.bind(this);
        this.getSuggestions = this.getSuggestions.bind(this);
    }

    // extractKeywords(text, language = 'en') {
    //     if (!text) return [];

    //     const tokens = text.toLowerCase().split(/\s+/);

    //     // We only filter for length. No stopword removal needed here.
    //     return [...new Set(tokens.filter(token => token.length > 2))];
    // }


    extractKeywords(text, language = 'en') {
        if (!text) return [];
        let tokens;
        if (language === 'ar') {
            const cleanedText = text.replace(/[^\u0600-\u06FF\s]/g, "").replace(/\s+/g, " ").trim();
            tokens = cleanedText.split(/\s+/);
        } else {
            tokens = this.tokenizer.tokenize(text.toLowerCase());
        }
        const stopwordsList = language === 'ar' ? stopword.ar : stopword.en;
        const relevantTokens = stopword.removeStopwords(tokens, stopwordsList);
        return [...new Set(relevantTokens.filter(token => token.length > 2))];
    }



    async initializeEmbeddingService() {
        this.embeddingService = await EmbeddingService.getInstance();
        console.log("Embedding service initialized.");
    }


    async getEmbedding(text, language = 'en') {
        if (!this.embeddingService) {
            this.embeddingService = await EmbeddingService.getInstance();
        }
        return this.embeddingService.getEmbedding(text, language);
    }

    containsArabic(text) {
        return /[\u0600-\u06FF]/.test(text);
    }






    // In EnhancedSmartKnowledgeController
    async findBestMatch(userInput) {
        try {
            const userLang = this.containsArabic(userInput) ? 'ar' : 'en';
            console.log(`\n--- New Hybrid Search ---`);
            console.log(`🌐 Lang: ${userLang} | 💬 Query: "${userInput}"`);

            const embeddingService = await EmbeddingService.getInstance();
            const queryVector = await embeddingService.getEmbedding(userInput, userLang);

            const textSearchKeywords = this.extractKeywords(userInput, userLang).join(' ');

            // Get candidates from both searches
            const [vectorCandidates, textCandidates] = await Promise.all([
                Knowledge.aggregate([
                    { $vectorSearch: { index: 'default', path: 'embedding', queryVector: queryVector, numCandidates: 150, limit: 5, filter: { language: { $eq: userLang } } } },
                    { $addFields: { score: { $meta: 'vectorSearchScore' } } }
                ]),
                Knowledge.aggregate([
                    {
                        //     $search: {
                        //         index: 'default',
                        //         compound: {
                        //             must: [
                        //                 { text: { query: userInput, path: "text", score: { boost: { value: 3 } } } },
                        //                 { text: { query: textSearchKeywords, path: "keywords" } }
                        //             ],
                        //             filter: [{ term: { path: 'language', query: userLang } }]
                        //         }
                        //     }
                        // },
                        $search: {
                            index: 'default',
                            compound: {
                                must: [
                                    {
                                        text: {
                                            query: userInput,
                                            path: ['text', 'keywords'],
                                            fuzzy: { maxEdits: 1 }
                                        }
                                    }],
                                filter: [{
                                    term: {
                                        path: 'language',
                                        query: userLang
                                    }
                                }]
                            }
                        }
                    },
                    { $limit: 5 },
                    { $addFields: { score: { $meta: 'searchScore' } } }
                ])
            ]);

            console.log(`🔍 Vector found: ${vectorCandidates.length} | Text found: ${textCandidates.length}`);

            // RRF Logic
            const rankedResults = {};
            const K = 60;

            vectorCandidates.forEach((doc, i) => {
                const rank = i + 1;
                if (!rankedResults[doc._id]) rankedResults[doc._id] = { doc, rrf_score: 0 };
                rankedResults[doc._id].rrf_score += 1 / (K + rank);
            });

            textCandidates.forEach((doc, i) => {
                const rank = i + 1;
                if (!rankedResults[doc._id]) rankedResults[doc._id] = { doc, rrf_score: 0 };
                rankedResults[doc._id].rrf_score += 1 / (K + rank);
            });

            const finalRankedList = Object.values(rankedResults).sort((a, b) => b.rrf_score - a.rrf_score);

            if (finalRankedList.length > 0) {
                const bestResult = finalRankedList[0].doc;
                bestResult.rrf_score = finalRankedList[0].rrf_score;
                console.log(`🎯 RRF Chose: "${bestResult.text.substring(0, 40)}..." (Score: ${bestResult.rrf_score.toFixed(4)})`);
                return bestResult;
            }

            console.log("❌ No candidates found.");
            return null;

        } catch (error) {
            console.error('❌ Critical error in hybrid search:', error);
            return null;
        }
    }








    async handleEnhancedChat(req, res) {
        const userInput = req.body.message;
        try {
            const matchedKnowledge = await this.findBestMatch(userInput);
            let aiReply;

            if (matchedKnowledge) {
                console.log(`✅ Final Match (RRF Score: ${matchedKnowledge.rrf_score.toFixed(4)}): "${matchedKnowledge.text}"`);
                Knowledge.findByIdAndUpdate(matchedKnowledge._id, {
                    $inc: { usageCount: 1 },
                    lastUsed: new Date()
                }).exec();

                const language = matchedKnowledge.language;
                //                 const prompt = `You are E-GPT, the official AI assistant for ISS Egypt. Your persona is a friendly, helpful senior student from ISS Egypt 🇪🇬.
                // Your task is to answer the user's question based STRICTLY and ONLY on the "Context Information" provided.

                // **Context Information:**
                // ---
                // ${matchedKnowledge.answer}
                // ---

                // **Instructions:**
                // 1. Rephrase the context in a natural, conversational tone. Do not just copy it.
                // 2. Use relevant emojis (like ✨, 🎓, 📍) to make the response engaging and easy to read.
                // 3. Ensure all core information and any links from the context are accurately included.
                // 4. Your entire response MUST be in ${language}. If the user is asking in Arabic, use a friendly Egyptian dialect.
                // 5. Start with a friendly opening like "Of course!", "Absolutely!", or the Arabic equivalent (e.g., "أكيد!", "طبعًا!").
                // 6. If there are steps to an answer, list them in order.
                // 7. Make the answer easy to read not just a block of words.
                // 8. If the question is in Arabic answer in Egyptian Dialect Always

                // **User's Question:** "${userInput}"

                // **Your Friendly Answer (in ${language}):**`;

                const prompt = `You are E-GPT — the official AI assistant for ISS Egypt. Your persona: a friendly, helpful senior student from ISS Egypt 🇪🇬 who speaks warmly and clearly.

Goal: Answer the user's question STRICTLY and ONLY using the "Context Information" provided. Do not add outside knowledge, opinions, or assumptions.

Context source:
---
${matchedKnowledge.answer}
---

Rules and behavior:
1. Start with a friendly opener: choose one of these (or their Arabic equivalent): "Of course!", "Absolutely!", "أكيد!", "طبعًا!".
2. Rephrase the context in a natural, conversational tone — do not copy it verbatim. Make it sound like a helpful senior student explaining to a peer.
3. Use relevant emojis (e.g., ✨, 🎓, 📍, ✅) to make the answer engaging and scannable.
4. Preserve every core fact and any links from the context exactly as they appear. If the context contains URLs or contact details, include them.
5. If the context implies steps, list them in order (numbered list). If not, present the information in short, clear bullet points or short paragraphs — not a wall of text.
6. Keep sentences concise and use clear headings or line breaks so the answer is easy to read.
7. Language policy:
   - Your entire reply must be in ${language}.
   - If the user asked in Arabic, reply in Egyptian Colloquial Arabic (friendly dialect).
8. Never introduce new facts, policies, or recommendations beyond what the context provides. If the context does not answer the user’s question, politely say you can only use the provided context and that the information isn’t available there.
9. If the context is empty or missing, respond: friendly opener + a brief statement that you can only answer from the provided context and that no relevant info was found.
10. Keep the tone friendly, casual, and helpful (like a senior student giving advice).

Formatting checklist (follow every time):
- Opening line: friendly opener.
- One-line summary rephrasing the context.
- Key details preserved with emojis and short lines or numbered steps.
- Include links/contact info exactly as in context.
- Closing line offering a brief follow-up question or help (e.g., "Do you want me to...?" or Arabic equivalent).

Example structure to follow:
1) Opening: "Of course!" / "أكيد!"
2) Short rephrase of the context (1–2 lines) with a 🎓 or ✨ emoji.
3) Bullet points or numbered steps listing core details, including any URLs or contacts verbatim.
4) Closing friendly offer to help further.

Now produce the user-facing answer strictly following these rules, using only the context above and nothing else.

Input fields available for your answer generation:
- ${matchedKnowledge.answer} — the full context you must rely on.
- ${userInput} — the user's question.
- ${language} — target reply language.

Begin your response to the user with the friendly opener and then proceed as specified.`

                aiReply = await this.callFreeAI(prompt);

            } else {
                // This block runs if findBestMatch returns null
                console.log(`❌ No confident match found. Saving as unknown.`);
                await Unknown.create({
                    question: userInput,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    userSession: req.sessionID || null
                });

                const generalPrompt = `You are E-GPT, the official AI assistant for the ISS Egypt Gateway website (for Egyptian students at UTM).
The user asked: "${userInput}"
Your knowledge base does not have a specific answer for this.
Please provide a helpful, general response. Politely inform the user that you don't have specific details on this topic and suggest they contact the ISS Egypt administration for official information.
Keep the response friendly and supportive. If the user asked in Arabic, respond in Arabic.`;

                aiReply = await this.callFreeAI(generalPrompt);
            }

            // --- 3. RETURN THE FINAL RESPONSE TO THE USER ---
            return res.json({ reply: aiReply });

        } catch (error) {
            console.error('❌ Enhanced chat error:', error);
            return res.status(500).json({
                reply: 'Sorry, I encountered an error. Please try again later.'
            });
        }
    }






    extractAdvancedKeywords(text) {
        const processed = this.preprocessText(text)
        const tokens = processed.split(" ").filter((token) => token.length > 2)
        const entities = this.extractEntities(text)
        return [...new Set([...tokens, ...entities])]
    }

    extractEntities(text) {
        const entities = []
        const textLower = text.toLowerCase()

        this.entityExtractor.roles.forEach((role) => {
            if (textLower.includes(role)) {
                entities.push(role)
            }
        })

        this.entityExtractor.organizations.forEach((org) => {
            if (textLower.includes(org)) {
                entities.push(org)
            }
        })

        return entities
    }

    // Call multiple free AI services with fallback
    async callFreeAI(prompt) {

        const { InferenceClient } = await import('@huggingface/inference');

        const freeAIServices = [
            // {
            //     name: 'OpenRouter OpenAI',
            //     url: 'https://openrouter.ai/api/v1/chat/completions',
            //     model: 'openai/gpt-oss-120b',
            //     headers: {
            //         'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            //         'Content-Type': 'application/json'
            //     }
            // },
            {
                name: 'OpenRouter OpenAI',
                url: 'https://openrouter.ai/api/v1/chat/completions',
                model: 'openai/gpt-oss-20b:free',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            },
            {
                name: 'OpenRouter OpenAI',
                url: 'https://openrouter.ai/api/v1/chat/completions',
                model: 'openai/gpt-4o-mini',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            },
            {
                name: 'OpenRouter Qwen',
                url: 'https://openrouter.ai/api/v1/chat/completions',
                model: 'qwen/qwen2.5-vl-32b-instruct:free',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            },
            {
                name: 'Deepseek',
                url: 'https://openrouter.ai/api/v1/chat/completions',
                model: 'deepseek/deepseek-chat-v3-0324:free',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            },
            {
                name: 'Hugging Face Novita',
                provider: 'huggingface',
                model: 'openai/gpt-oss-120b',
                hfProvider: 'novita',
                token: process.env.HF_TOKEN
            }
        ];

        for (const service of freeAIServices) {
            try {
                let response;

                if (service.name.includes('OpenRouter')) {
                    response = await axios.post(service.url, {
                        model: service.model,
                        messages: [{ role: 'user', content: prompt }],
                        max_tokens: 300,
                        temperature: 0.7
                    }, { headers: service.headers });

                    return response.data.choices[0].message.content;

                } else if (service.provider === 'huggingface') {
                    const client = new InferenceClient(service.token);

                    const chatCompletion = await client.chatCompletion({
                        provider: service.hfProvider,
                        model: service.model,
                        messages: [
                            {
                                role: "user",
                                content: prompt,
                            },
                        ],
                    });

                    return chatCompletion.choices[0].message.content;
                }

            } catch (error) {
                console.error(`${service.name} failed:`, error.message);
                continue; // Try next service
            }
        }

        // If all AI services fail, return a helpful message
        return "I'm having trouble connecting to my AI services right now. Please try again in a moment, or contact our support team for immediate assistance.";
    }

    // async callFreeAIWithTimeout(prompt, timeoutMs = 8000) {
    //     return Promise.race([
    //         this.callFreeAI(prompt),
    //         new Promise((_, reject) => setTimeout(() => reject(new Error("AI Timeout")), timeoutMs))
    //     ]);
    // }

    // Learn from interactions to improve future responses
    async learnFromInteraction(userInput, aiResponse, matchedKnowledge) {
        try {
            // Extract keywords from user input
            const newKeywords = this.extractKeywords(userInput);

            // Update the matched knowledge with new keywords
            if (matchedKnowledge && newKeywords.length > 0) {
                const existingKeywords = matchedKnowledge.keywords || [];
                const uniqueNewKeywords = newKeywords.filter(k => !existingKeywords.includes(k));

                if (uniqueNewKeywords.length > 0) {
                    await Knowledge.findByIdAndUpdate(matchedKnowledge._id, {
                        $push: { keywords: { $each: uniqueNewKeywords } }
                    });
                }
            }

            // You could also create new knowledge entries based on successful interactions
            // This would require admin approval in a real system

        } catch (error) {
            console.error('Error learning from interaction:', error);
        }
    }


    extractKeywords(text, language = 'en') {
        if (!text) return [];
        let tokens;

        if (language === 'ar') {
            const cleanedText = text.replace(/[^\u0600-\u06FF\s]/g, "").replace(/\s+/g, " ").trim();
            tokens = cleanedText.split(/\s+/);
        } else {
            tokens = this.tokenizer.tokenize(text.toLowerCase());
        }

        const stopwords = language === 'ar' ? stopword.ar : stopword.en;
        const relevantTokens = stopword.removeStopwords(tokens, stopwords);
        return [...new Set(relevantTokens.filter(token => token.length > 2))];
    }



    extractArabicKeywords(text) {
        if (!text) return []

        const arabicStopWords = [
            "من",
            "في",
            "على",
            "ما",
            "و",
            "هو",
            "هي",
            "مع",
            "عن",
            "إلى",
            "هذا",
            "ذلك",
            "كل",
            "أن",
            "إن",
            "لم",
        ]
        const words = text
            .replace(/[^\u0600-\u06FF\s]/g, "")
            .split(/\s+/)
            .filter((word) => word.length > 2 && !arabicStopWords.includes(word))

        return [...new Set(words)]
    }


    async getAnalytics(req, res) {
        try {
            // 1. Get the 10 most frequently used knowledge items
            const mostPopular = await Knowledge.find({ isActive: true })
                .sort({ usageCount: -1 })
                .limit(10)
                .select('text language usageCount lastUsed'); // Only select relevant fields

            // 2. Get the 10 most recently used knowledge items
            const recentlyUsed = await Knowledge.find({ isActive: true })
                .sort({ lastUsed: -1 })
                .limit(10)
                .select('text language usageCount lastUsed');

            // 3. Analyze the most frequent UNKNOWN questions
            // This is extremely valuable for knowing what to add to the knowledge base!
            const frequentUnknown = await Unknown.aggregate([
                {
                    $group: {
                        // Group similar questions by their lowercase version
                        _id: { $toLower: "$question" },
                        // Count how many times each unique question appears
                        count: { $sum: 1 },
                        // Get the timestamp of the most recent time it was asked
                        lastAsked: { $max: "$createdAt" }
                    }
                },
                {
                    // Sort by the most frequently asked questions first
                    $sort: { count: -1 }
                },
                {
                    // Limit to the top 15 most common unknown questions
                    $limit: 15
                },
                {
                    // Rename the '_id' field to 'question' for a cleaner output
                    $project: {
                        _id: 0,
                        question: "$_id",
                        count: 1,
                        lastAsked: 1
                    }
                }
            ]);

            // 4. Get overall statistics
            const totalKnowledgeEntries = await Knowledge.countDocuments();
            const totalUnknownQuestions = await Unknown.countDocuments();

            // 5. Send the complete analytics object back to the admin
            res.status(200).json({
                totalKnowledgeEntries,
                totalUnknownQuestions,
                mostPopular,
                recentlyUsed,
                frequentUnknown
            });

        } catch (error) {
            console.error("Error fetching analytics:", error);
            res.status(500).json({ error: "Failed to retrieve analytics data." });
        }
    }



    async createKnowledgeAI(req, res) {
        try {
            const { text, answer, language, keywords: manualKeywords = [], category, priority } = req.body;
            const embeddingService = await EmbeddingService.getInstance();

            console.log("Generating synthetic questions for rephrasing...");
            const generationPrompt = `Based on the following question and answer, generate 3 additional, distinct ways a user might ask this question in the same language. The user might use slang, abbreviations, or different phrasing.
        Original Question: "${text}"
        Answer: "${answer}"
        Output ONLY a JavaScript-style array of strings. For example: ["question 1", "question 2", "question 3"]`;

            const response = await this.callFreeAI(generationPrompt);
            let syntheticQuestions = [];
            try {
                syntheticQuestions = JSON.parse(response.match(/\[.*\]/s)[0]);
            } catch (e) {
                console.error("Failed to parse synthetic questions:", response);
            }

            const allQuestions = [text, ...syntheticQuestions];
            console.log("All question variants to be indexed:", allQuestions);

            for (const questionText of allQuestions) {
                // **CRITICAL FIX 1:** Always extract keywords for ALL languages.
                const extractedFromText = this.extractKeywords(questionText, language);
                const extractedFromAnswer = this.extractKeywords(answer, language);

                const combinedKeywords = [
                    ...manualKeywords.map(k => k.toLowerCase()),
                    ...extractedFromText,
                    ...extractedFromAnswer
                ];
                const allUniqueKeywords = [...new Set(combinedKeywords)];

                const textToEmbed = `${questionText} ${answer} ${allUniqueKeywords.join(' ')}`;

                // **CRITICAL FIX 2:** Pass the language to the embedding service.
                const embedding = await embeddingService.getEmbedding(textToEmbed, language);

                await Knowledge.create({
                    text: questionText,
                    answer,
                    language,
                    embedding,
                    keywords: allUniqueKeywords,
                    category: category || "other",
                    priority: priority || 1,
                    isActive: true,
                });
            }

            res.status(201).json({
                message: `Knowledge saved successfully. Created 1 canonical and ${syntheticQuestions.length} synthetic entries.`,
                canonicalQuestion: text,
                syntheticQuestions
            });
        } catch (error) {
            console.error("Error creating knowledge:", error);
            res.status(500).json({ error: "Failed to create knowledge: " + error.message });
        }
    }




    async createKnowledge(req, res) {
        try {
            const { text, answer, language, keywords: manualKeywords = [], category, priority } = req.body;
            const embeddingService = await EmbeddingService.getInstance();

            console.log("Creating knowledge for:", text);

            // Extract keywords from both question and answer
            const extractedFromText = this.extractKeywords(text, language);
            const extractedFromAnswer = this.extractKeywords(answer, language);

            const combinedKeywords = [
                ...manualKeywords.map(k => k.toLowerCase()),
                ...extractedFromText,
                ...extractedFromAnswer
            ];
            const allUniqueKeywords = [...new Set(combinedKeywords)];

            const textToEmbed = `${text} ${answer} ${allUniqueKeywords.join(' ')}`;

            // Generate embedding
            const embedding = await embeddingService.getEmbedding(textToEmbed, language);

            // Save single entry
            await Knowledge.create({
                text,
                answer,
                language,
                embedding,
                keywords: allUniqueKeywords,
                category: category || "other",
                priority: priority || 1,
                isActive: true,
            });

            res.status(201).json({
                message: "Knowledge saved successfully.",
                canonicalQuestion: text,
                syntheticQuestions: [] // Keeping the property for compatibility
            });

        } catch (error) {
            console.error("Error creating knowledge:", error);
            res.status(500).json({ error: "Failed to create knowledge: " + error.message });
        }
    }








    async updateKnowledge(req, res) {
        const { id } = req.params;

        // 1. Validate the MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "No such knowledge entry found." });
        }

        try {
            const {
                text,
                answer,
                keywords: manualKeywords,
                priority,
                category
            } = req.body;

            // 2. Find the existing document to get its language
            const existingKnowledge = await Knowledge.findById(id);
            if (!existingKnowledge) {
                return res.status(404).json({ error: "No such knowledge entry found." });
            }

            // 3. Prepare the update object
            const updateData = { text, answer, priority, category };

            // 4. Check if the core text has changed to decide if we need to regenerate data
            const textHasChanged = text && text !== existingKnowledge.text;
            const answerHasChanged = answer && answer !== existingKnowledge.answer;

            if (textHasChanged || answerHasChanged || manualKeywords) {
                // If text or answer has changed, we MUST regenerate the embedding
                console.log("Text/Answer changed, regenerating embedding and keywords...");

                const newText = text || existingKnowledge.text;
                const newAnswer = answer || existingKnowledge.answer;

                // Regenerate keywords using the hybrid approach
                const extractedFromText = this.extractKeywords(newText, existingKnowledge.language);
                const extractedFromAnswer = this.extractKeywords(newAnswer, existingKnowledge.language);
                const combinedKeywords = [
                    ...(manualKeywords || existingKnowledge.keywords).map(k => k.toLowerCase()),
                    ...extractedFromText,
                    ...extractedFromAnswer
                ];
                updateData.keywords = [...new Set(combinedKeywords)];

                // Regenerate embedding
                const textToEmbed = `${newText} ${newAnswer}`;
                const embeddingService = await EmbeddingService.getInstance();
                updateData.embedding = await embeddingService.getEmbedding(textToEmbed);
            }

            // 5. Perform the update in the database
            const updatedKnowledge = await Knowledge.findByIdAndUpdate(id, updateData, { new: true }); // {new: true} returns the updated doc

            res.status(200).json({
                message: "Knowledge updated successfully.",
                data: updatedKnowledge
            });

        } catch (error) {
            console.error("Error updating knowledge:", error);
            res.status(500).json({ error: "Failed to update knowledge: " + error.message });
        }
    }

    async deleteKnowledge(req, res) {
        const { id } = req.params;

        // 1. Validate the MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "No such knowledge entry found." });
        }

        try {
            // 2. Find and delete the document in one step
            const deletedKnowledge = await Knowledge.findByIdAndDelete(id);

            // 3. Check if a document was actually found and deleted
            if (!deletedKnowledge) {
                return res.status(404).json({ error: "No such knowledge entry found." });
            }

            res.status(200).json({
                message: "Knowledge deleted successfully.",
                deletedItem: deletedKnowledge
            });
        } catch (error) {
            console.error("Error deleting knowledge:", error);
            res.status(500).json({ error: "Failed to delete knowledge: " + error.message });
        }
    }


    async getSuggestions(req, res) {
        try {
            const suggestions = await Knowledge.find({ isActive: true })
                .select('_id text language keywords');
            res.status(200).json(suggestions);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            res.status(500).json({ error: "Failed to fetch suggestions." });
        }
    }

}



// Initialize the smart controller
// const smartController = new SmartKnowledgeController();
const enhancedSmartController = new EnhancedSmartKnowledgeController()
// Export enhanced functions
module.exports = {

    // Original functions
    // getAll: async (req, res) => {
    //     const items = await Knowledge.find({}).sort({ createdAt: -1 });
    //     res.status(200).json(items);
    // },


    getAll: async (req, res) => {
        try {
            // --- 1. PARSE QUERY PARAMETERS ---
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const { language, category, sortBy, sortOrder = 'desc', search } = req.query;

            // --- 2. BUILD THE FILTER QUERY ---
            let filterQuery = { isActive: true };
            if (language) filterQuery.language = language;
            if (category) filterQuery.category = category;
            if (search) {
                // Case-insensitive search on 'text' and 'keywords' fields
                filterQuery.$or = [
                    { text: { $regex: search, $options: 'i' } },
                    { keywords: { $regex: search, $options: 'i' } }
                ];
            }

            // --- 3. BUILD THE SORT QUERY ---
            let sortQuery = { createdAt: -1 }; // Default sort
            if (sortBy) {
                sortQuery = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
            }

            // --- 4. EXECUTE QUERIES ---
            // Get the total count of documents matching the filter for pagination
            const totalEntries = await Knowledge.countDocuments(filterQuery);
            const totalPages = Math.ceil(totalEntries / limit);

            // Get the paginated and filtered data
            const items = await Knowledge.find(filterQuery)
                .sort(sortQuery)
                .skip(skip)
                .limit(limit);

            res.status(200).json({
                data: items,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalEntries
                }
            });

        } catch (error) {
            console.error("Error fetching knowledge:", error);
            res.status(500).json({ error: "Failed to fetch knowledge entries." });
        }
    },




    getItem: async (req, res) => {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "No Such Item Found" });
        }
        const item = await Knowledge.findById(id);
        if (!item) {
            return res.status(404).json({ error: "No Such Item Found" });
        }
        res.status(200).json(item);
    },




    createKnowledge: enhancedSmartController.createKnowledge.bind(enhancedSmartController),
    createKnowledgeAI: enhancedSmartController.createKnowledgeAI.bind(enhancedSmartController),

    // Enhanced chat handler
    handleChatRequest: enhancedSmartController.handleEnhancedChat.bind(enhancedSmartController),

    updateKnowledge: enhancedSmartController.updateKnowledge.bind(enhancedSmartController),
    deleteKnowledge: enhancedSmartController.deleteKnowledge.bind(enhancedSmartController),
    getSuggestions: enhancedSmartController.getSuggestions.bind(enhancedSmartController),
    getAnalytics: enhancedSmartController.getAnalytics.bind(enhancedSmartController)


};