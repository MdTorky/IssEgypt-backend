class EmbeddingService {
    static instance = null;
    static promise = null; // We will store the initialization promise here

    static getInstance() {
        if (this.instance === null && this.promise === null) {
            this.promise = (async () => {
                const { HfInference } = await import('@huggingface/inference');

                const service = new EmbeddingService();
                // console.log("Initializing Hugging Face Inference Client...");

                const hfToken = process.env.HF_TOKEN;
                if (!hfToken) {
                    throw new Error("FATAL: HF_TOKEN environment variable is not set.");
                }

                // Create an instance of the official client
                service.inference = new HfInference(hfToken);

                this.instance = service;
                // console.log("✅ Hugging Face Inference Client ready.");
                return this.instance;
            })();
        }
        return this.promise;
    }

    async getEmbedding(text, language = 'en') {
        if (!this.inference) {
            throw new Error("Hugging Face Inference client was not ready. This is an unexpected error.");
        }

        try {
            // console.log(`🚀 Calling Hugging Face API via official library for: "${text.substring(0, 50)}..."`);

            const embedding = await this.inference.featureExtraction({
                // model: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
                model: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
                inputs: text
            });

            if (Array.isArray(embedding)) {
                // console.log("✅ Received embedding from API.");
                return Array.isArray(embedding[0]) ? embedding[0] : embedding;
            } else {
                throw new Error("Invalid response structure from Hugging Face API.");
            }

        } catch (error) {
            console.error("❌ Hugging Face Library Error:", error.message);
            throw new Error(`Failed to generate embedding via API: ${error.message}`);
        }
    }
}

module.exports = EmbeddingService;