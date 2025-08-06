// const Knowledge = require('../models/knowledgeModel')
// const Unknown = require('../models/unknownModel');
// const axios = require('axios');
// const mongoose = require('mongoose')
// const natural = require('natural'); // Free NLP library
// const stopword = require('stopword'); // Free stopword removal

// // Enhanced Knowledge Controller with Free AI Intelligence
// class SmartKnowledgeController {
//     constructor() {
//         this.stemmer = natural.PorterStemmer;
//         this.tokenizer = new natural.WordTokenizer();
//         this.tfidf = new natural.TfIdf();
//         this.synonyms = this.loadSynonyms();
//         this.initializeTfIdf();
//     }

//     // Load synonyms for better matching (completely free)
//     loadSynonyms() {
//         return {
//             'pictures': ['photos', 'images', 'gallery', 'pics', 'photographs'],
//             'photos': ['pictures', 'images', 'gallery', 'pics', 'photographs'],
//             'gallery': ['pictures', 'photos', 'images', 'pics', 'photographs'],
//             'events': ['activities', 'happenings', 'occasions', 'functions'],
//             'past': ['previous', 'former', 'old', 'earlier'],
//             'find': ['locate', 'search', 'look for', 'get', 'see'],
//             'where': ['how', 'what location', 'which place'],
//             'iss egypt': ['iss gateway', 'iss egypt gateway', 'our organization', 'our company'],
//             'about': ['information', 'details', 'info', 'description'],
//             'contact': ['reach', 'get in touch', 'communicate', 'call', 'email'],
//             'location': ['address', 'place', 'where', 'position'],
//             'courses': ['programs', 'classes', 'training', 'education'],
//             'admission': ['enrollment', 'registration', 'apply', 'join'],
//             'fees': ['cost', 'price', 'tuition', 'payment'],
//             'schedule': ['timetable', 'timing', 'hours', 'calendar']
//         };
//     }

//     // Initialize TF-IDF with knowledge base
//     async initializeTfIdf() {
//         try {
//             const knowledge = await Knowledge.find({});
//             knowledge.forEach(item => {
//                 const processedQuestion = this.preprocessText(item.question);
//                 this.tfidf.addDocument(processedQuestion);
//             });
//         } catch (error) {
//             console.error('Error initializing TF-IDF:', error);
//         }
//     }

//     // Preprocess text for better matching
//     preprocessText(text) {
//         if (!text) return '';

//         // Convert to lowercase
//         let processed = text.toLowerCase();

//         // Tokenize
//         let tokens = this.tokenizer.tokenize(processed);

//         // Remove stopwords
//         tokens = stopword.removeStopwords(tokens);

//         // Expand synonyms
//         let expandedTokens = [];
//         tokens.forEach(token => {
//             expandedTokens.push(token);
//             if (this.synonyms[token]) {
//                 expandedTokens.push(...this.synonyms[token]);
//             }
//         });

//         // Stem words
//         const stemmedTokens = expandedTokens.map(token => this.stemmer.stem(token));

//         return stemmedTokens.join(' ');
//     }

//     // Calculate semantic similarity between two texts
//     calculateSimilarity(text1, text2) {
//         const processed1 = this.preprocessText(text1);
//         const processed2 = this.preprocessText(text2);

//         // Use natural's distance function
//         const distance = natural.JaroWinklerDistance(processed1, processed2);

//         // Also check for common words
//         const tokens1 = processed1.split(' ');
//         const tokens2 = processed2.split(' ');

//         const commonWords = tokens1.filter(token => tokens2.includes(token));
//         const commonWordScore = commonWords.length / Math.max(tokens1.length, tokens2.length);

//         // Combine scores
//         return (distance * 0.7) + (commonWordScore * 0.3);
//     }

//     // Find best matching knowledge with improved algorithm
//     async findBestMatch(userInput) {
//         try {
//             const allKnowledge = await Knowledge.find({});
//             let bestMatch = null;
//             let bestScore = 0;

//             for (const item of allKnowledge) {
//                 // Calculate similarity with question
//                 const questionScore = this.calculateSimilarity(userInput, item.question);

//                 // Calculate similarity with keywords
//                 const keywordText = item.keywords ? item.keywords.join(' ') : '';
//                 const keywordScore = this.calculateSimilarity(userInput, keywordText);

//                 // Calculate similarity with answer for context
//                 const answerScore = this.calculateSimilarity(userInput, item.answer) * 0.3;

//                 // Combined score
//                 const totalScore = Math.max(questionScore, keywordScore) + answerScore;

//                 if (totalScore > bestScore && totalScore > 0.4) { // Lower threshold for better matches
//                     bestScore = totalScore;
//                     bestMatch = item;
//                 }
//             }

//             return bestMatch;
//         } catch (error) {
//             console.error('Error finding best match:', error);
//             return null;
//         }
//     }

//     // Enhanced chat handler with multiple free AI options
//     async handleEnhancedChat(req, res) {
//         const userInput = req.body.message;
//         let prompt;

//         try {
//             // First try to find relevant knowledge
//             const matchedKnowledge = await this.findBestMatch(userInput);

//             if (matchedKnowledge) {
//                 // Create context-aware prompt
//                 prompt = `You are an intelligent assistant for ISS Egypt Gateway website. 

// Context Information:
// ${matchedKnowledge.answer}

// Instructions:
// - Answer based on the provided context information
// - Be helpful and specific to ISS Egypt Gateway
// - If the context doesn't fully answer the question, use your general knowledge but stay focused on ISS Egypt Gateway
// - Keep responses concise and friendly
// - Always prioritize the context information provided
// - If the Question in Arabic find the matching keyword in the context information, answer in Arabic

// User Question: ${userInput}

// Response:`;

//                 // Try multiple free AI services in order of preference
//                 const response = await this.callFreeAI(prompt);

//                 // Learn from this interaction
//                 await this.learnFromInteraction(userInput, response, matchedKnowledge);

//                 return res.json({ reply: response });

//             } else {
//                 // No direct match found, save as unknown and try general AI
//                 await Unknown.create({ question: userInput });

//                 // Try to answer with general knowledge but ISS Egypt focused
//                 const generalPrompt = `You are an assistant for ISS Egypt Gateway website. The user asked: "${userInput}"

// Since no specific information is available in the knowledge base, try to help based on what you know about:
// - ISS Egypt Gateway (International Student Society of Egypt in UTM)
// - General educational services
// - UTM (Universiti Teknologi Malaysia) related topics

// Keep the response helpful but mention that for specific details about ISS Egypt Gateway, they should contact the administration.

// Response:`;

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

//     // Call multiple free AI services with fallback
//     async callFreeAI(prompt) {
//         const freeAIServices = [
//             {
//                 name: 'OpenRouter Qwen',
//                 url: 'https://openrouter.ai/api/v1/chat/completions',
//                 model: 'qwen/qwen2.5-vl-32b-instruct:free',
//                 headers: {
//                     'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
//                     'Content-Type': 'application/json'
//                 }
//             },
// {
//             name: 'Deepseek',
//             url: 'https://openrouter.ai/api/v1/chat/completions',
//             model: 'deepseek/deepseek-chat-v3-0324:free',
//             headers: {
//                 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         },
//             {
//                 name: 'OpenRouter Gemma',
//                 url: 'https://openrouter.ai/api/v1/chat/completions',
//                 model: 'google/gemma-2-9b-it:free',
//                 headers: {
//                     'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
//                     'Content-Type': 'application/json'
//                 }
//             },
//             {
//                 name: 'Hugging Face',
//                 url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
//                 headers: {
//                     'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
//                     'Content-Type': 'application/json'
//                 }
//             }
//         ];

//         for (const service of freeAIServices) {
//             try {
//                 let response;

//                 if (service.name.includes('OpenRouter')) {
//                     response = await axios.post(service.url, {
//                         model: service.model,
//                         messages: [{ role: 'user', content: prompt }],
//                         max_tokens: 300,
//                         temperature: 0.7
//                     }, { headers: service.headers });

//                     return response.data.choices[0].message.content;

//                 } else if (service.name === 'Hugging Face') {
//                     response = await axios.post(service.url, {
//                         inputs: prompt,
//                         parameters: {
//                             max_length: 300,
//                             temperature: 0.7
//                         }
//                     }, { headers: service.headers });

//                     return response.data.generated_text || response.data[0].generated_text;
//                 }

//             } catch (error) {
//                 console.error(`${service.name} failed:`, error.message);
//                 continue; // Try next service
//             }
//         }

//         // If all AI services fail, return a helpful message
//         return "I'm having trouble connecting to my AI services right now. Please try again in a moment, or contact our support team for immediate assistance.";
//     }

//     // Learn from interactions to improve future responses
//     async learnFromInteraction(userInput, aiResponse, matchedKnowledge) {
//         try {
//             // Extract keywords from user input
//             const newKeywords = this.extractKeywords(userInput);

//             // Update the matched knowledge with new keywords
//             if (matchedKnowledge && newKeywords.length > 0) {
//                 const existingKeywords = matchedKnowledge.keywords || [];
//                 const uniqueNewKeywords = newKeywords.filter(k => !existingKeywords.includes(k));

//                 if (uniqueNewKeywords.length > 0) {
//                     await Knowledge.findByIdAndUpdate(matchedKnowledge._id, {
//                         $push: { keywords: { $each: uniqueNewKeywords } }
//                     });
//                 }
//             }

//             // You could also create new knowledge entries based on successful interactions
//             // This would require admin approval in a real system

//         } catch (error) {
//             console.error('Error learning from interaction:', error);
//         }
//     }

//     // Extract keywords from text
//     extractKeywords(text) {
//         const processed = this.preprocessText(text);
//         const tokens = processed.split(' ').filter(token => token.length > 2);

//         // Remove duplicates and return
//         return [...new Set(tokens)];
//     }

//     // Bulk knowledge import for easier management
//     async bulkImportKnowledge(req, res) {
//         try {
//             const { knowledgeItems } = req.body;

//             const processedItems = knowledgeItems.map(item => ({
//                 ...item,
//                 keywords: this.extractKeywords(item.question + ' ' + item.answer)
//             }));

//             await Knowledge.insertMany(processedItems);

//             // Reinitialize TF-IDF
//             await this.initializeTfIdf();

//             res.json({ message: 'Knowledge imported successfully', count: processedItems.length });

//         } catch (error) {
//             console.error('Bulk import error:', error);
//             res.status(500).json({ error: 'Failed to import knowledge' });
//         }
//     }

//     // Get analytics about unknown questions
//     async getAnalytics(req, res) {
//         try {
//             const unknownQuestions = await Unknown.find({}).sort({ date: -1 }).limit(50);
//             const knowledgeCount = await Knowledge.countDocuments();

//             // Group similar unknown questions
//             const groupedQuestions = this.groupSimilarQuestions(unknownQuestions);

//             res.json({
//                 totalKnowledge: knowledgeCount,
//                 recentUnknownQuestions: groupedQuestions,
//                 suggestions: this.generateKnowledgeSuggestions(groupedQuestions)
//             });

//         } catch (error) {
//             console.error('Analytics error:', error);
//             res.status(500).json({ error: 'Failed to get analytics' });
//         }
//     }

//     // Group similar unknown questions
//     groupSimilarQuestions(questions) {
//         const groups = [];
//         const processed = new Set();

//         questions.forEach(q1 => {
//             if (processed.has(q1._id.toString())) return;

//             const group = [q1];
//             processed.add(q1._id.toString());

//             questions.forEach(q2 => {
//                 if (processed.has(q2._id.toString())) return;

//                 const similarity = this.calculateSimilarity(q1.question, q2.question);
//                 if (similarity > 0.6) {
//                     group.push(q2);
//                     processed.add(q2._id.toString());
//                 }
//             });

//             groups.push({
//                 questions: group,
//                 count: group.length,
//                 representative: group[0].question
//             });
//         });

//         return groups.sort((a, b) => b.count - a.count);
//     }

//     // Generate suggestions for new knowledge entries
//     generateKnowledgeSuggestions(groupedQuestions) {
//         return groupedQuestions.slice(0, 10).map(group => ({
//             suggestedQuestion: group.representative,
//             frequency: group.count,
//             variants: group.questions.map(q => q.question)
//         }));
//     }
// }

// // Initialize the smart controller
// const smartController = new SmartKnowledgeController();

// // Export enhanced functions
// module.exports = {
//     // Original functions
//     getAll: async (req, res) => {
//         const items = await Knowledge.find({}).sort({ createdAt: -1 });
//         res.status(200).json(items);
//     },

//     getItem: async (req, res) => {
//         const { id } = req.params;
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(404).json({ error: "No Such Item Found" });
//         }
//         const item = await Knowledge.findById(id);
//         if (!item) {
//             return res.status(404).json({ error: "No Such Item Found" });
//         }
//         res.status(200).json(item);
//     },

//     createKnowledge: async (req, res) => {
//         const { question, answer, priority, category, keywords: userKeywords = [] } = req.body;

//         // Extract keywords from text
//         const extractedKeywords = smartController.extractKeywords(question + ' ' + answer);

//         // Combine both and remove duplicates (case-insensitive)
//         const allKeywords = [...new Set([
//             ...userKeywords.map(k => k.toLowerCase()),
//             ...extractedKeywords.map(k => k.toLowerCase())
//         ])];

//         await Knowledge.create({
//             question,
//             answer,
//             keywords: allKeywords,
//             priority,
//             category
//         });

//         // Reinitialize TF-IDF model
//         await smartController.initializeTfIdf();

//         res.json({ message: 'Knowledge saved successfully.' });
//     },

//     // Enhanced chat handler
//     handleChatRequest: smartController.handleEnhancedChat.bind(smartController),

//     // New enhanced functions
//     bulkImportKnowledge: smartController.bulkImportKnowledge.bind(smartController),
//     getAnalytics: smartController.getAnalytics.bind(smartController)
// };
























































const Knowledge = require("../models/knowledgeModel")
const Unknown = require("../models/unknownModel")
const axios = require("axios")
const mongoose = require("mongoose")
const natural = require("natural")
const stopword = require("stopword")

class EnhancedSmartKnowledgeController {
    constructor() {
        this.stemmer = natural.PorterStemmer
        this.tokenizer = new natural.WordTokenizer()
        this.tfidf = new natural.TfIdf()
        this.synonyms = this.loadSynonyms()
        this.arabicSynonyms = this.loadArabicSynonyms()
        this.entityExtractor = this.initializeEntityExtractor()
        this.initializeTfIdf()
    }

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

    containsArabic(text) {
        return /[\u0600-\u06FF]/.test(text)
    }

    detectLanguage(text) {
        return this.containsArabic(text) ? "arabic" : "english"
    }

    preprocessArabicText(text) {
        // Remove diacritics
        text = text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")

        // Normalize Arabic characters
        text = text.replace(/[إأآا]/g, "ا")
        text = text.replace(/[ؤئء]/g, "ء")
        text = text.replace(/[ةه]/g, "ه")
        text = text.replace(/ي/g, "ى")

        return text
    }

    preprocessText(text) {
        if (!text) return ""

        let processed = text.toLowerCase()

        if (this.containsArabic(text)) {
            processed = this.preprocessArabicText(processed)
        }

        let tokens = this.tokenizer.tokenize(processed)
        tokens = this.removeStopwords(tokens)
        const expandedTokens = this.expandSynonyms(tokens)

        const stemmedTokens = expandedTokens.map((token) => {
            return this.containsArabic(token) ? token : this.stemmer.stem(token)
        })

        return stemmedTokens.join(" ")
    }

    removeStopwords(tokens) {
        tokens = stopword.removeStopwords(tokens)
        const arabicStopwords = [
            "في",
            "من",
            "إلى",
            "على",
            "عن",
            "مع",
            "هذا",
            "هذه",
            "التي",
            "الذي",
            "أن",
            "أو",
            "لا",
            "نعم",
            "كان",
            "كانت",
            "يكون",
            "تكون",
        ]
        tokens = tokens.filter((token) => !arabicStopwords.includes(token))
        return tokens
    }

    expandSynonyms(tokens) {
        const expandedTokens = []

        tokens.forEach((token) => {
            expandedTokens.push(token)

            if (this.synonyms[token]) {
                expandedTokens.push(...this.synonyms[token])
            }

            if (this.arabicSynonyms[token]) {
                expandedTokens.push(...this.arabicSynonyms[token])
            }
        })

        return [...new Set(expandedTokens)]
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

    calculateAdvancedSimilarity(userInput, knowledgeItem) {
        const userProcessed = this.preprocessText(userInput)
        const questionProcessed = this.preprocessText(knowledgeItem.question)
        const keywordText = knowledgeItem.keywords ? knowledgeItem.keywords.join(" ") : ""
        const keywordProcessed = this.preprocessText(keywordText)

        // Check Arabic content too
        const arabicQuestionProcessed = knowledgeItem.arabicQuestion
            ? this.preprocessText(knowledgeItem.arabicQuestion)
            : ""
        const arabicKeywordText = knowledgeItem.arabicKeywords ? knowledgeItem.arabicKeywords.join(" ") : ""
        const arabicKeywordProcessed = this.preprocessText(arabicKeywordText)

        const questionSimilarity = natural.JaroWinklerDistance(userProcessed, questionProcessed)
        const keywordSimilarity = natural.JaroWinklerDistance(userProcessed, keywordProcessed)
        const arabicQuestionSimilarity = arabicQuestionProcessed
            ? natural.JaroWinklerDistance(userProcessed, arabicQuestionProcessed)
            : 0
        const arabicKeywordSimilarity = arabicKeywordProcessed
            ? natural.JaroWinklerDistance(userProcessed, arabicKeywordProcessed)
            : 0

        const entityBonus = this.calculateEntityBonus(userInput, knowledgeItem)
        const contextBonus = this.calculateContextBonus(userInput, knowledgeItem)
        const priorityWeight = (knowledgeItem.priority || 1) / 10

        const baseScore = Math.max(questionSimilarity, keywordSimilarity, arabicQuestionSimilarity, arabicKeywordSimilarity)

        const finalScore = baseScore + entityBonus + contextBonus + priorityWeight
        return Math.min(finalScore, 1)
    }

    calculateEntityBonus(userInput, knowledgeItem) {
        let bonus = 0
        const userLower = userInput.toLowerCase()
        const keywords = [...(knowledgeItem.keywords || []), ...(knowledgeItem.arabicKeywords || [])]

        if (this.entityExtractor.roles.some((role) => userLower.includes(role))) {
            if (keywords.some((keyword) => this.entityExtractor.roles.includes(keyword))) {
                bonus += 0.3
            }
        }

        if (this.entityExtractor.organizations.some((org) => userLower.includes(org))) {
            if (keywords.some((keyword) => this.entityExtractor.organizations.includes(keyword))) {
                bonus += 0.2
            }
        }

        if (this.entityExtractor.services.some((service) => userLower.includes(service))) {
            if (keywords.some((keyword) => this.entityExtractor.services.includes(keyword))) {
                bonus += 0.2
            }
        }

        return bonus
    }

    calculateContextBonus(userInput, knowledgeItem) {
        let bonus = 0
        const userLower = userInput.toLowerCase()

        const questionTypes = ["who", "what", "where", "when", "how", "من", "ما", "أين", "متى", "كيف"]
        const userQuestionType = questionTypes.find((type) => userLower.includes(type))

        if (userQuestionType) {
            if ((userQuestionType === "who" || userQuestionType === "من") && knowledgeItem.category === "contact") {
                bonus += 0.25
            }

            if (
                (userQuestionType === "what" || userQuestionType === "ما") &&
                (knowledgeItem.category === "services" || knowledgeItem.category === "about")
            ) {
                bonus += 0.2
            }

            if ((userQuestionType === "where" || userQuestionType === "أين") && knowledgeItem.answer.includes("http")) {
                bonus += 0.2
            }
        }

        return bonus
    }

    async findBestMatch(userInput) {
        try {
            const allKnowledge = await Knowledge.find({ isActive: true })
            const matches = []

            for (const item of allKnowledge) {
                const score = this.calculateAdvancedSimilarity(userInput, item)

                if (score > 0.3) {
                    matches.push({
                        knowledge: item,
                        score: score,
                    })
                }
            }

            matches.sort((a, b) => b.score - a.score)

            if (matches.length > 0 && matches[0].score > 0.4) {
                await matches[0].knowledge.incrementUsage()
                return matches[0].knowledge
            }

            return null
        } catch (error) {
            console.error("Error finding best match:", error)
            return null
        }
    }

    createEnhancedPrompt(userInput, knowledge, language) {
        const isArabic = language === "arabic"

        const systemPrompt = isArabic
            ? `أنت مساعد ذكي لموقع اتحاد الطلاب المصريين في جامعة التكنولوجيا الماليزية (ISS Egypt).`
            : `You are an intelligent assistant for ISS Egypt Gateway website (International Student Society of Egypt in UTM).`

        const instructions = isArabic
            ? `التعليمات:
- أجب بناءً على المعلومات المقدمة في السياق
- كن مفيداً ومحدداً بخصوص اتحاد الطلاب المصريين
- اجعل الردود موجزة وودودة
- أعطِ الأولوية للمعلومات المقدمة في السياق
- أجب باللغة العربية`
            : `Instructions:
- Answer based on the provided context information
- Be helpful and specific to ISS Egypt UTM
- Keep responses concise and friendly
- Always prioritize the context information provided
- Answer in English`

        // Use Arabic content if available and user is asking in Arabic
        const contextAnswer = isArabic && knowledge.arabicAnswer ? knowledge.arabicAnswer : knowledge.answer

        return `${systemPrompt}

معلومات السياق / Context Information:
${contextAnswer}

${instructions}

سؤال المستخدم / User Question: ${userInput}

الرد / Response:`
    }

    async callEnhancedAI(prompt, language) {
        const services = [
            {
                name: "OpenRouter Qwen",
                url: "https://openrouter.ai/api/v1/chat/completions",
                model: "qwen/qwen2.5-vl-32b-instruct:free",
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
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
                name: 'OpenRouter Gemma',
                url: 'https://openrouter.ai/api/v1/chat/completions',
                model: 'google/gemma-2-9b-it:free',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            },
            {
                name: 'Hugging Face',
                url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        ]

        for (const service of services) {
            try {
                const response = await axios.post(
                    service.url,
                    {
                        model: service.model,
                        messages: [{ role: "user", content: prompt }],
                        max_tokens: 400,
                        temperature: 0.7,
                    },
                    {
                        headers: service.headers,
                        timeout: 10000,
                    },
                )

                return response.data.choices[0].message.content
            } catch (error) {
                console.error(`${service.name} failed:`, error.message)
                continue
            }
        }

        return language === "arabic"
            ? "أواجه مشكلة في الاتصال بخدمات الذكاء الاصطناعي حالياً. يرجى المحاولة مرة أخرى."
            : "I'm having trouble connecting to AI services right now. Please try again."
    }

    async handleEnhancedChat(req, res) {
        const userInput = req.body.message
        const userLanguage = this.detectLanguage(userInput)

        try {
            const matchedKnowledge = await this.findBestMatch(userInput)

            if (matchedKnowledge) {
                const prompt = this.createEnhancedPrompt(userInput, matchedKnowledge, userLanguage)
                const response = await this.callEnhancedAI(prompt, userLanguage)

                return res.json({
                    reply: response,
                    confidence: 0.85,
                    source: "knowledge_base",
                })
            } else {
                await Unknown.create({
                    question: userInput,
                    language: userLanguage,
                    date: new Date(),
                })

                const fallbackMessage =
                    userLanguage === "arabic"
                        ? "عذراً، لم أتمكن من العثور على إجابة لسؤالك. يرجى التواصل مع إدارة الجمعية."
                        : "Sorry, I couldn't find an answer to your question. Please contact ISS Egypt administration."

                return res.json({
                    reply: fallbackMessage,
                    confidence: 0.3,
                    source: "fallback",
                })
            }
        } catch (error) {
            console.error("Enhanced chat error:", error)
            const errorMessage =
                userLanguage === "arabic"
                    ? "عذراً، واجهت مشكلة. يرجى المحاولة مرة أخرى."
                    : "Sorry, I encountered an error. Please try again later."

            return res.status(500).json({ reply: errorMessage })
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

    async initializeTfIdf() {
        try {
            const knowledge = await Knowledge.find({ isActive: true })
            this.tfidf = new natural.TfIdf()

            knowledge.forEach((item) => {
                const combinedText = `${item.question} ${item.answer} ${(item.keywords || []).join(" ")} ${item.arabicQuestion || ""} ${item.arabicAnswer || ""} ${(item.arabicKeywords || []).join(" ")}`
                const processedText = this.preprocessText(combinedText)
                this.tfidf.addDocument(processedText)
            })

            console.log("TF-IDF initialized with", knowledge.length, "documents")
        } catch (error) {
            console.error("Error initializing TF-IDF:", error)
        }
    }
}

const enhancedSmartController = new EnhancedSmartKnowledgeController()

module.exports = {
    getAll: async (req, res) => {
        try {
            const items = await Knowledge.find({}).sort({ createdAt: -1 })
            res.status(200).json(items)
        } catch (error) {
            console.error("Error getting all knowledge:", error)
            res.status(500).json({ error: "Failed to get knowledge" })
        }
    },

    getItem: async (req, res) => {
        try {
            const { id } = req.params
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Invalid ID" })
            }
            const item = await Knowledge.findById(id)
            if (!item) {
                return res.status(404).json({ error: "Knowledge not found" })
            }
            res.status(200).json(item)
        } catch (error) {
            console.error("Error getting knowledge item:", error)
            res.status(500).json({ error: "Failed to get knowledge item" })
        }
    },

    createKnowledge: async (req, res) => {
        try {
            const {
                question,
                arabicQuestion,
                answer,
                arabicAnswer,
                arabicKeywords: userArabicKeywords = [],
                priority,
                category,
                keywords: userKeywords = [],
            } = req.body

            // Extract keywords from text using enhanced extraction
            const extractedKeywords = enhancedSmartController.extractAdvancedKeywords(question + " " + answer)
            const arabicExtracted = enhancedSmartController.extractArabicKeywords(
                `${arabicQuestion || ""} ${arabicAnswer || ""}`,
            )

            // Combine keywords and remove duplicates
            const allKeywords = [
                ...new Set([...userKeywords.map((k) => k.toLowerCase()), ...extractedKeywords.map((k) => k.toLowerCase())]),
            ]

            const allArabicKeywords = [
                ...new Set([...userArabicKeywords.map((k) => k.toLowerCase()), ...arabicExtracted.map((k) => k.toLowerCase())]),
            ]

            const newKnowledge = await Knowledge.create({
                question,
                arabicQuestion,
                answer,
                arabicAnswer,
                keywords: allKeywords,
                arabicKeywords: allArabicKeywords,
                priority: priority || 1,
                category: category || "other",
                createdBy: "admin",
                isActive: true,
            })

            // Reinitialize TF-IDF model
            await enhancedSmartController.initializeTfIdf()

            res.json({
                message: "Knowledge saved successfully.",
                id: newKnowledge._id,
                extractedKeywords: extractedKeywords,
                arabicExtracted: arabicExtracted,
            })
        } catch (error) {
            console.error("Error creating knowledge:", error)
            res.status(500).json({ error: "Failed to create knowledge: " + error.message })
        }
    },

    handleChatRequest: enhancedSmartController.handleEnhancedChat.bind(enhancedSmartController),

    searchKnowledge: async (req, res) => {
        try {
            const { query, category, language } = req.query

            const filter = { isActive: true }

            if (category && category !== "all") {
                filter.category = category
            }

            const allKnowledge = await Knowledge.find(filter)
            const results = []

            for (const item of allKnowledge) {
                const score = enhancedSmartController.calculateAdvancedSimilarity(query, item)

                if (score > 0.2) {
                    results.push({
                        ...item.toObject(),
                        similarityScore: score,
                    })
                }
            }

            results.sort((a, b) => b.similarityScore - a.similarityScore)

            res.json({
                query,
                resultsCount: results.length,
                results: results.slice(0, 20),
                language: language || enhancedSmartController.detectLanguage(query),
            })
        } catch (error) {
            console.error("Search knowledge error:", error)
            res.status(500).json({ error: "Failed to search knowledge" })
        }
    },
}
