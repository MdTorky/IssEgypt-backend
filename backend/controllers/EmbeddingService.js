// --- START OF REVISED FILE: EmbeddingService.js ---
const { AutoTokenizer, AutoModel } = require('@xenova/transformers');



class EmbeddingService {
    static instance = null;
    static promise = null;

    static getInstance() {
        if (this.instance === null && this.promise === null) {
            this.promise = (async () => {
                const service = new EmbeddingService();
                console.log("Initializing embedding model...");

                try {
                    service.tokenizer = await AutoTokenizer.from_pretrained('Xenova/paraphrase-multilingual-MiniLM-L12-v2');
                    service.model = await AutoModel.from_pretrained('Xenova/paraphrase-multilingual-MiniLM-L12-v2');
                    this.instance = service;
                    console.log("✅ Embedding model loaded successfully.");
                } catch (error) {
                    console.error("❌ Failed to load embedding model:", error);
                    throw error;
                }

                return this.instance;
            })();
        }
        return this.promise;
    }

    // Add text preprocessing method for consistency
    preprocessText(text, language = 'en') {
        if (language === 'ar') {
            return text
                .trim()
                .replace(/\s+/g, ' ')
                .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - '٠'.charCodeAt(0) + '0'.charCodeAt(0)));
        } else {
            return text
                .trim()
                .toLowerCase()
                .replace(/\s+/g, ' ');
        }
    }

    async getEmbedding(text, language = 'en') {
        if (!this.tokenizer || !this.model) {
            throw new Error("Embedding model was not ready.");
        }

        const preprocessedText = this.preprocessText(text, language);
        console.log(`🔤 Preprocessed text (${language}):`, preprocessedText.substring(0, 100));

        try {
            const inputs = await this.tokenizer(preprocessedText, {
                padding: true,
                truncation: true,
                max_length: 512,
                return_tensors: 'pt'
            });

            const output = await this.model(inputs);
            const embeddings = output.last_hidden_state;

            const tokenCount = embeddings.dims[1];
            const embeddingDim = embeddings.dims[2];
            const data = embeddings.data;

            const embedding = new Array(embeddingDim).fill(0);

            const attentionMask = inputs.attention_mask?.data || new Array(tokenCount).fill(1);
            let validTokens = 0;

            for (let i = 0; i < tokenCount; i++) {
                if (attentionMask[i]) {
                    validTokens++;
                    for (let j = 0; j < embeddingDim; j++) {
                        embedding[j] += data[i * embeddingDim + j];
                    }
                }
            }

            for (let j = 0; j < embeddingDim; j++) {
                embedding[j] /= Math.max(validTokens, 1);
            }

            // L2 normalization
            const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
            if (norm === 0) throw new Error("Zero norm vector produced");

            const normalized = embedding.map(val => parseFloat((val / norm).toFixed(8)));

            console.log("✅ Generated embedding - Length:", normalized.length, "Norm:", norm.toFixed(4));

            return normalized;
        } catch (error) {
            console.error("❌ Error generating embedding:", error);
            throw error;
        }
    }

    // DEBUGGING METHOD - Add this to your EmbeddingService.js
    async debugEmbeddingMismatch(userInput = "اجيب لينك الدرايف منين؟", Knowledge) {
        try {
            console.log("🚨 DEBUGGING EMBEDDING MISMATCH");
            console.log("=====================================");

            // 1. Generate current embedding
            const currentEmbedding = await this.getEmbedding(userInput, 'ar');
            console.log("📊 Current embedding stats:", {
                length: currentEmbedding.length,
                sample: currentEmbedding.slice(0, 5),
                norm: Math.sqrt(currentEmbedding.reduce((sum, val) => sum + val * val, 0)),
                min: Math.min(...currentEmbedding),
                max: Math.max(...currentEmbedding)
            });

            // 2. Get the correct stored document
            const correctDoc = await Knowledge.findOne({
                answer: { $regex: "تقدر توصل للدرايف", $options: 'i' },
                language: 'ar'
            });

            if (!correctDoc) {
                console.log("❌ Couldn't find the correct document");
                return;
            }

            console.log("📝 Found correct document:", {
                id: correctDoc._id,
                text: correctDoc.text.substring(0, 100),
                answer: correctDoc.answer.substring(0, 100)
            });

            // 3. Analyze stored embedding
            const storedEmbedding = correctDoc.embedding;
            console.log("💾 Stored embedding stats:", {
                length: storedEmbedding.length,
                sample: storedEmbedding.slice(0, 5),
                norm: Math.sqrt(storedEmbedding.reduce((sum, val) => sum + val * val, 0)),
                min: Math.min(...storedEmbedding),
                max: Math.max(...storedEmbedding)
            });

            // 4. Calculate manual cosine similarity
            const cosineSim = this.calculateCosineSimilarity(currentEmbedding, storedEmbedding);
            console.log("🎯 Manual cosine similarity:", cosineSim.toFixed(6));

        } catch (error) {
            console.error("❌ Debug error:", error);
        }
    }

    // TEST WITHOUT NORMALIZATION METHOD - Add this to your EmbeddingService.js
    async testWithoutNormalization(userInput, Knowledge) {
        try {
            console.log("🔍 Testing with RAW (non-normalized) embedding:");

            const inputs = await this.tokenizer(userInput, {
                padding: true,
                truncation: true,
                return_tensors: 'pt'
            });

            const output = await this.model(inputs);
            const embeddings = output.last_hidden_state;

            const tokenCount = embeddings.dims[1];
            const embeddingDim = embeddings.dims[2];
            const data = embeddings.data;

            const rawEmbedding = new Array(embeddingDim).fill(0);

            for (let i = 0; i < tokenCount; i++) {
                for (let j = 0; j < embeddingDim; j++) {
                    rawEmbedding[j] += data[i * embeddingDim + j];
                }
            }

            for (let j = 0; j < embeddingDim; j++) {
                rawEmbedding[j] /= tokenCount;
            }

            console.log("Raw embedding norm:", Math.sqrt(rawEmbedding.reduce((sum, val) => sum + val * val, 0)));

            // Try vector search with raw embedding
            const vectorResults = await Knowledge.aggregate([
                {
                    $vectorSearch: {
                        index: 'default',
                        path: 'embedding',
                        queryVector: rawEmbedding,
                        numCandidates: 100,
                        limit: 5,
                        filter: { language: { $eq: 'ar' } }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        text: 1,
                        answer: 1,
                        score: { $meta: 'vectorSearchScore' }
                    }
                }
            ]);

            console.log("📊 Raw embedding results:");
            vectorResults.forEach((result, i) => {
                console.log(`${i + 1}. Score: ${result.score.toFixed(4)} - "${result.text.substring(0, 50)}..."`);
            });

            return vectorResults;

        } catch (error) {
            console.error("❌ Raw embedding test failed:", error);
        }
    }

    // Helper method for cosine similarity
    calculateCosineSimilarity(a, b) {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

module.exports = EmbeddingService;
// --- END OF REVISED FILE: EmbeddingService.js ---