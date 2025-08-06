const Knowledge = require('../models/knowledgeModel')
const Unknown = require('../models/unknownModel');
const axios = require('axios');
const mongoose = require('mongoose')
const natural = require('natural'); // Free NLP library
const stopword = require('stopword');
const { newStemmer } = require('./Stemmer.js');
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
        this.updateKnowledge = this.updateKnowledge.bind(this);
        this.deleteKnowledge = this.deleteKnowledge.bind(this);
        this.getAnalytics = this.getAnalytics.bind(this);
    }

    extractKeywords(text, language = 'en') {
        if (!text) return [];

        // 1. Tokenize the text into individual words
        const tokens = this.tokenizer.tokenize(text.toLowerCase());

        // 2. Determine which stopwords to use (English or Arabic)
        const stopwords = language === 'ar' ? stopword.ar : stopword.en;

        // 3. Remove the common stopwords
        const relevantTokens = stopword.removeStopwords(tokens, stopwords);

        // 4. Filter out any remaining short words (noise) and return unique keywords
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

    normalizeArabic(text = "") {
        return text
            .replace(/[إأآا]/g, "ا")
            .replace(/ى/g, "ي")
            .replace(/ؤ/g, "و")
            .replace(/ئ/g, "ي")
            .replace(/ة/g, "ه")
            .replace(/[^\w\s\u0600-\u06FF]/g, '') // Remove punctuation
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }

    // Load synonyms for better matching (completely free)
    loadSynonyms() {
        return {
            pictures: ["photos", "images", "gallery", "pics", "photographs", "صور", "صورة", "معرض"],
            photos: ["pictures", "images", "gallery", "pics", "photographs", "صور", "صورة"],
            events: ["activities", "happenings", "occasions", "functions", "فعاليات", "أحداث", "أنشطة"],
            courses: ["programs", "classes", "training", "education", "دورات", "برامج", "تدريب"],
            contact: ["reach", "get in touch", "communicate", "call", "email", "تواصل", "اتصال"],
            president: ["leader", "head", "chief", "رئيس", "قائد"],
            vice: ["deputy", "assistant", "نائب", "مساعد"],
            board: ["committee", "council", "members", "leadership", "مجلس", "لجنة", "أعضاء"],
            services: ["offerings", "facilities", "help", "خدمات", "مساعدة"],
            about: ["information", "details", "info", "description", "عن", "معلومات", "تفاصيل"],
            "iss egypt": ["iss gateway", "international student society", "جمعية الطلاب المصريين"],
            utm: ["universiti teknologi malaysia", "جامعة التكنولوجيا الماليزية"],
            who: ["what", "which person", "من", "مين"],
            what: ["which", "how", "ما", "ماذا", "إيه"],
            where: ["location", "place", "أين", "فين"],
            how: ["method", "way", "كيف", "إزاي"],
            when: ["time", "date", "متى", "إمتى"],
        }
    }

    loadArabicSynonyms() {
        return {
            "من هو": ["who is", "who are", "مين هو", "مين"],
            "ما هو": ["what is", "what are", "إيه هو", "إيه"],
            أين: ["where", "فين", "وين"],
            كيف: ["how", "إزاي", "كيفاش"],
            متى: ["when", "إمتى", "وقت إيه"],
            رئيس: ["president", "leader", "قائد"],
            نائب: ["vice", "deputy", "مساعد"],
            مجلس: ["board", "committee", "لجنة"],
            خدمات: ["services", "مساعدة", "تسهيلات"],
            معلومات: ["information", "details", "تفاصيل"],
            تواصل: ["contact", "اتصال", "تليفون"],
            دورات: ["courses", "برامج", "تدريب"],
            فعاليات: ["events", "أحداث", "أنشطة"],
            صور: ["photos", "pictures", "معرض"],
        }
    }

    initializeEntityExtractor() {
        return {
            roles: ["president", "vice president", "secretary", "treasurer", "رئيس", "نائب الرئيس"],
            organizations: ["iss egypt", "utm", "جمعية الطلاب المصريين", "جامعة التكنولوجيا الماليزية"],
            services: ["internships", "ai tools", "clubs", "drive", "academic", "تدريب", "أدوات الذكاء الاصطناعي"],
            question_types: ["who", "what", "where", "when", "how", "من", "ما", "أين", "متى", "كيف"],
        }
    }

    // Initialize TF-IDF with knowledge base
    async initializeTfIdf() {
        try {
            const knowledge = await Knowledge.find({ isActive: true });

            this.tfidfEnglish = new natural.TfIdf();
            this.tfidfArabic = new natural.TfIdf();

            knowledge.forEach((item) => {
                const englishText = `${item.question} ${item.answer} ${(item.keywords || []).join(" ")}`;
                const arabicText = `${item.arabicQuestion || ""} ${item.arabicAnswer || ""} ${(item.arabicKeywords || []).join(" ")}`;

                if (englishText.trim()) {
                    this.tfidfEnglish.addDocument(this.preprocessText(englishText));
                }

                if (arabicText.trim()) {
                    // UPDATED: Pass a flag to indicate the language
                    this.tfidfArabic.addDocument(this.preprocessText(arabicText, true));
                }
            });

            console.log("TF-IDF initialized with", knowledge.length, "documents");
        } catch (error) {
            console.error("Error initializing TF-IDF:", error);
        }
    }


    // Preprocess text for better matching
    preprocessText(text, isArabic = false) {
        if (!text) return '';
        let processed = text.toLowerCase();
        let tokens;
        let stemmedTokens;


        if (isArabic || this.containsArabic(processed)) {
            processed = this.normalizeArabic(processed);
            tokens = this.tokenizer.tokenize(processed);
            tokens = stopword.removeStopwords(tokens, stopword.ar);
            // CORRECTED: Use the imported stemmer object directly
            stemmedTokens = tokens.map(token => this.arabicStemmer.stem(token));
        } else {
            tokens = this.tokenizer.tokenize(processed);
            tokens = stopword.removeStopwords(tokens);
            stemmedTokens = tokens.map(token => this.englishStemmer.stem(token));
        }

        // This part remains the same
        let expandedTokens = [];
        tokens.forEach(token => {
            expandedTokens.push(token);
            for (const [key, values] of Object.entries(this.synonyms)) {
                if (values.includes(token) && !expandedTokens.includes(key)) {
                    expandedTokens.push(key);
                }
            }
        });

        return stemmedTokens.join(' ');
    }


    // Calculate semantic similarity between two texts
    calculateSimilarity(text1, text2) {
        const processed1 = this.preprocessText(text1);
        const processed2 = this.preprocessText(text2);

        const distance = natural.JaroWinklerDistance(processed1, processed2);

        const tokens1 = processed1.split(' ');
        const tokens2 = processed2.split(' ');
        const commonWords = tokens1.filter(token => tokens2.includes(token));
        const commonWordScore = commonWords.length / Math.max(tokens1.length, tokens2.length);

        return (distance * 0.7) + (commonWordScore * 0.3);
    }



    // اجيب لينك الدرايف منين؟
    // مين اللي عمل الموقع ده؟





    async findBestMatchHybrid(userInput) {
        try {
            const userLang = this.containsArabic(userInput) ? 'ar' : 'en';
            console.log(`🌐 Detected language: ${userLang}`);

            // Consistent text preprocessing
            const processedInput = userLang === 'ar'
                ? this.normalizeArabic(userInput)
                : userInput.trim().toLowerCase();

            console.log(`🔤 Processed input: "${processedInput}"`);

            // Get embedding with language parameter
            const embeddingService = await EmbeddingService.getInstance();
            const queryVector = await embeddingService.getEmbedding(processedInput, userLang);

            console.log("✅ Query vector generated:", {
                length: queryVector.length,
                sample: queryVector.slice(0, 5),
                valid: Array.isArray(queryVector) && queryVector.length === 384 && !queryVector.includes(NaN)
            });

            // VECTOR SEARCH with improved parameters
            let vectorResults = [];

            try {
                vectorResults = await Knowledge.aggregate([
                    {
                        $vectorSearch: {
                            index: 'default',
                            path: 'embedding',
                            queryVector,
                            numCandidates: 200,
                            limit: 5,
                            filter: { language: { $eq: userLang } }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            text: 1,
                            answer: 1,
                            language: 1,
                            keywords: 1,
                            score: { $meta: 'vectorSearchScore' }
                        }
                    }
                ]);

                console.log(`🔍 Vector search returned ${vectorResults.length} results`);

                if (vectorResults.length > 0) {
                    vectorResults.forEach((result, index) => {
                        console.log(`Result ${index + 1}: Score ${result.score.toFixed(4)} - "${result.text.substring(0, 50)}..."`);
                    });

                    const scores = vectorResults.map(r => r.score);
                    const maxScore = Math.max(...scores);
                    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

                    console.log(`📊 Score analysis - Max: ${maxScore.toFixed(4)}, Avg: ${avgScore.toFixed(4)}`);

                    // Lower thresholds for better results
                    const dynamicThreshold = Math.max(
                        userLang === 'ar' ? 0.50 : 0.55, // Much lower base threshold
                        avgScore * 0.7 // Or 70% of average score
                    );

                    console.log(`🎯 Using dynamic threshold: ${dynamicThreshold.toFixed(4)}`);

                    if (vectorResults[0].score >= dynamicThreshold) {
                        console.log(`✅ Vector search SUCCESS (Score: ${vectorResults[0].score.toFixed(4)})`);
                        return vectorResults[0];
                    } else {
                        console.log(`🟡 Best vector score (${vectorResults[0].score.toFixed(4)}) < threshold (${dynamicThreshold.toFixed(4)})`);
                    }
                } else {
                    console.log("⚠️ No vector results found");
                }

            } catch (vectorError) {
                console.error("❌ Vector search error:", vectorError.message);
            }

            // ENHANCED TEXT SEARCH FALLBACK
            console.log(`🔄 Falling back to text search for language: ${userLang}`);

            const searchKeywords = userLang === 'ar'
                ? this.extractArabicKeywords(processedInput).join(' ')
                : this.extractKeywords(processedInput, userLang).join(' ');

            console.log(`🔑 Search keywords: "${searchKeywords}"`);

            const textResults = await Knowledge.aggregate([
                {
                    $search: {
                        index: 'default',
                        compound: {
                            should: [
                                {
                                    text: {
                                        query: processedInput,
                                        path: 'text',
                                        fuzzy: { maxEdits: 2 }
                                    }
                                },
                                {
                                    text: {
                                        query: searchKeywords,
                                        path: 'keywords',
                                        fuzzy: { maxEdits: 1 }
                                    }
                                }
                            ],
                            filter: [{ term: { path: 'language', query: userLang } }]
                        }
                    }
                },
                { $limit: 3 },
                {
                    $project: {
                        _id: 1,
                        text: 1,
                        answer: 1,
                        language: 1,
                        keywords: 1,
                        score: { $meta: 'searchScore' }
                    }
                }
            ]);

            if (textResults.length > 0) {
                console.log(`✅ Text search SUCCESS (Score: ${textResults[0].score.toFixed(4)})`);
                return textResults[0];
            }

            console.log("❌ All search strategies failed");
            return null;

        } catch (error) {
            console.error('❌ Critical error in hybrid search:', error);
            return null;
        }
    }




    async findBestMatch(userInput) {
        try {
            const userLang = this.containsArabic(userInput) ? 'ar' : 'en';
            console.log(`\n--- New Search Request ---`);
            console.log(`🌐 Detected language: ${userLang}`);
            console.log(`💬 User input: "${userInput}"`);

            const queryVector = await this.getEmbedding(userInput, userLang);

            // This pipeline runs both searches and prepares for RRF
            const pipeline = [
                {
                    $vectorSearch: {
                        index: 'default',
                        path: 'embedding',
                        queryVector: queryVector,
                        numCandidates: 150,
                        limit: 5,
                        filter: { language: { $eq: userLang } }
                    }
                },
                { $set: { search_method: 'vector', score: { $meta: 'vectorSearchScore' } } },
                {
                    $unionWith: {
                        coll: 'knowledge_v2s',
                        pipeline: [
                            {
                                $search: {
                                    index: 'default',
                                    compound: {
                                        must: [{ text: { query: userInput, path: ['text', 'keywords'], fuzzy: {} } }],
                                        filter: [{ term: { path: 'language', query: userLang } }]
                                    }
                                }
                            },
                            { $limit: 5 },
                            { $set: { search_method: 'text', score: { $meta: 'searchScore' } } }
                        ]
                    }
                },
                { $group: { _id: "$_id", doc: { $first: "$$ROOT" }, methods: { $push: "$search_method" } } },
                { $replaceRoot: { newRoot: "$doc" } }
            ];

            const candidates = await Knowledge.aggregate(pipeline);

            if (candidates.length === 0) {
                console.log("❌ No candidates found from either search method.");
                return null;
            }

            // --- RECIPROCAL RANK FUSION (RRF) ---
            const rankedResults = {};
            const K = 60; // Standard RRF constant

            // Create separate lists for ranking
            const vectorList = candidates.filter(c => c.search_method === 'vector').sort((a, b) => b.score - a.score);
            const textList = candidates.filter(c => c.search_method === 'text').sort((a, b) => b.score - a.score);

            // Process vector results
            vectorList.forEach((doc, index) => {
                const rank = index + 1;
                if (!rankedResults[doc._id]) rankedResults[doc._id] = { doc: doc, rrf_score: 0 };
                rankedResults[doc._id].rrf_score += 1 / (K + rank);
            });

            // Process text results
            textList.forEach((doc, index) => {
                const rank = index + 1;
                if (!rankedResults[doc._id]) rankedResults[doc._id] = { doc: doc, rrf_score: 0 };
                rankedResults[doc._id].rrf_score += 1 / (K + rank);
            });

            const finalRankedList = Object.values(rankedResults).sort((a, b) => b.rrf_score - a.rrf_score);

            console.log("--- RRF Reranking Results ---");
            finalRankedList.slice(0, 3).forEach((item, index) => {
                console.log(`${index + 1}. RRF Score: ${item.rrf_score.toFixed(4)} - "${item.doc.text.substring(0, 50)}..."`);
            });

            if (finalRankedList.length > 0) {
                const bestResult = finalRankedList[0].doc;
                bestResult.rrf_score = finalRankedList[0].rrf_score; // Attach the score for logging
                return bestResult;
            }

            return null;

        } catch (error) {
            console.error('❌ Critical error in hybrid search:', error);
            return null;
        }
    }




    // Enhanced chat handler with multiple free AI options
    //     async handleEnhancedChat(req, res) {
    //         const userInput = req.body.message;
    //         try {
    //             const matchedKnowledge = await this.findBestMatchHybrid(userInput);


    //             if (matchedKnowledge) {
    //                 console.log(`Matched Item (Score: ${matchedKnowledge.score.toFixed(2)}): "${matchedKnowledge.text}"`);

    //                 try {
    //                     // Update the usage count and last used timestamp in the database.
    //                     // We do this in the background and don't wait for it to finish,
    //                     // so the user gets their answer instantly.
    //                     Knowledge.findByIdAndUpdate(matchedKnowledge._id, {
    //                         $inc: { usageCount: 1 }, // Atomically increment the usage count by 1
    //                         lastUsed: new Date()    // Update the last used timestamp
    //                     }).exec(); // .exec() fires the query without needing to await
    //                 } catch (updateError) {
    //                     console.error("Failed to update knowledge usage stats:", updateError);
    //                 }


    //                 const language = matchedKnowledge.language === 'ar' ? "Arabic" : "English";
    //                 const prompt = `You are E-GPT, the official AI assistant for ISS Egypt. Your persona is a friendly, helpful senior student from ISS Egypt 🇪🇬.

    // Your task is to answer the user's question based STRICTLY and ONLY on the "Context Information" provided.

    // **Context Information:**
    // ---
    // ${matchedKnowledge.answer}
    // ---

    // **Instructions:**
    // 1.  **Rephrase the context** in a natural, conversational tone. Do not just copy it.
    // 2.  **Use relevant emojis** (like ✨, 🎓, 📍) to make the response engaging and easy to read.
    // 3.  Ensure all core information and any links from the context are accurately included.
    // 4.  Your entire response **MUST be in ${language}**. If the user is asking in Arabic, use a friendly Egyptian dialect.
    // 5.  Start with a friendly opening like "Of course!", "Absolutely!", or the Arabic equivalent (e.g., "أكيد!", "طبعًا!").
    // 6.  If there are steps to an answer, list them in order.
    // 7.  Make the answer easy to read not just a block of words.

    // **User's Question:** "${userInput}"

    // **Your Friendly Answer (in ${language}):**`;

    //                 // Try multiple free AI services in order of preference
    //                 const response = await this.callFreeAI(prompt);
    //                 await this.learnFromInteraction(userInput, response, matchedKnowledge);
    //                 return res.json({ reply: response });

    //             } else {
    //                 // No direct match found, save as unknown and try general AI
    //                 await Unknown.create({
    //                     question: userInput,
    //                     ipAddress: req.ip,
    //                     userAgent: req.headers['user-agent'],
    //                     context: '', // optionally previous message
    //                     userSession: req.sessionID || null
    //                 });

    //                 const generalPrompt = `You are E-GPT, the official AI assistant for the ISS Egypt Gateway website (for Egyptian students at UTM).
    // The user asked: "${userInput}"

    // Your knowledge base does not have a specific answer for this.
    // Please provide a helpful, general response. Politely inform the user that you don't have specific details on this topic and suggest they contact the ISS Egypt administration for official information.
    // Keep the response friendly and supportive. If the user asked in Arabic, respond in Arabic.`;

    //                 const response = await this.callFreeAI(generalPrompt);
    //                 return res.json({ reply: response });

    //             }

    //         } catch (error) {
    //             console.error('Enhanced chat error:', error);
    //             return res.status(500).json({
    //                 reply: 'Sorry, I encountered an error. Please try again later.'
    //             });
    //         }
    //     }



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
                const prompt = `You are E-GPT, the official AI assistant for ISS Egypt. Your persona is a friendly, helpful senior student from ISS Egypt 🇪🇬.
Your task is to answer the user's question based STRICTLY and ONLY on the "Context Information" provided.

**Context Information:**
---
${matchedKnowledge.answer}
---

**Instructions:**
1. Rephrase the context in a natural, conversational tone. Do not just copy it.
2. Use relevant emojis (like ✨, 🎓, 📍) to make the response engaging and easy to read.
3. Ensure all core information and any links from the context are accurately included.
4. Your entire response MUST be in ${language}. If the user is asking in Arabic, use a friendly Egyptian dialect.
5. Start with a friendly opening like "Of course!", "Absolutely!", or the Arabic equivalent (e.g., "أكيد!", "طبعًا!").
6.  If there are steps to an answer, list them in order.
7.  Make the answer easy to read not just a block of words.

**User's Question:** "${userInput}"

**Your Friendly Answer (in ${language}):**`;

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
        const freeAIServices = [
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
            // {
            //     name: 'Deepseek',
            //     url: 'https://openrouter.ai/api/v1/chat/completions',
            //     model: 'deepseek/deepseek-chat-v3-0324:free',
            //     headers: {
            //         'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            //         'Content-Type': 'application/json'
            //     }
            // },
            // {
            //     name: 'OpenRouter Gemma',
            //     url: 'https://openrouter.ai/api/v1/chat/completions',
            //     model: 'google/gemma-2-9b-it:free',
            //     headers: {
            //         'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            //         'Content-Type': 'application/json'
            //     }
            // },
            // {
            //     name: 'Hugging Face',
            //     url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
            //     headers: {
            //         'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            //         'Content-Type': 'application/json'
            //     }
            // }
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

                } else if (service.name === 'Hugging Face') {
                    response = await axios.post(service.url, {
                        inputs: prompt,
                        parameters: {
                            max_length: 300,
                            temperature: 0.7
                        }
                    }, { headers: service.headers });

                    return response.data.generated_text || response.data[0].generated_text;
                }

            } catch (error) {
                console.error(`${service.name} failed:`, error.message);
                continue; // Try next service
            }
        }

        // If all AI services fail, return a helpful message
        return "I'm having trouble connecting to my AI services right now. Please try again in a moment, or contact our support team for immediate assistance.";
    }

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


    // Bulk knowledge import for easier management
    async bulkImportKnowledge(req, res) {
        try {
            const { knowledgeItems } = req.body;

            const processedItems = knowledgeItems.map(item => ({
                ...item,
                keywords: this.extractKeywords(item.question + ' ' + item.answer)
            }));

            await Knowledge.insertMany(processedItems);

            // Reinitialize TF-IDF
            await this.initializeTfIdf();

            res.json({ message: 'Knowledge imported successfully', count: processedItems.length });

        } catch (error) {
            console.error('Bulk import error:', error);
            res.status(500).json({ error: 'Failed to import knowledge' });
        }
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


    // Group similar unknown questions
    groupSimilarQuestions(questions) {
        const groups = [];
        const processed = new Set();

        questions.forEach(q1 => {
            if (processed.has(q1._id.toString())) return;

            const group = [q1];
            processed.add(q1._id.toString());

            questions.forEach(q2 => {
                if (processed.has(q2._id.toString())) return;

                const similarity = this.calculateSimilarity(q1.question, q2.question);
                if (similarity > 0.6) {
                    group.push(q2);
                    processed.add(q2._id.toString());
                }
            });

            groups.push({
                questions: group,
                count: group.length,
                representative: group[0].question
            });
        });

        return groups.sort((a, b) => b.count - a.count);
    }

    // Generate suggestions for new knowledge entries
    generateKnowledgeSuggestions(groupedQuestions) {
        return groupedQuestions.slice(0, 10).map(group => ({
            suggestedQuestion: group.representative,
            frequency: group.count,
            variants: group.questions.map(q => q.question)
        }));
    }



    async createKnowledge(req, res) {
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



}



// Initialize the smart controller
// const smartController = new SmartKnowledgeController();
const enhancedSmartController = new EnhancedSmartKnowledgeController()
// Export enhanced functions
module.exports = {

    // Original functions
    getAll: async (req, res) => {
        const items = await Knowledge.find({}).sort({ createdAt: -1 });
        res.status(200).json(items);
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

    // Enhanced chat handler
    handleChatRequest: enhancedSmartController.handleEnhancedChat.bind(enhancedSmartController),

    updateKnowledge: enhancedSmartController.updateKnowledge.bind(enhancedSmartController),
    deleteKnowledge: enhancedSmartController.deleteKnowledge.bind(enhancedSmartController),

    // New enhanced functions
    bulkImportKnowledge: enhancedSmartController.bulkImportKnowledge.bind(enhancedSmartController),
    getAnalytics: enhancedSmartController.getAnalytics.bind(enhancedSmartController)


};