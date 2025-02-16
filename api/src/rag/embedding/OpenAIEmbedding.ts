import { OpenAIEmbeddings } from "@langchain/openai"; // Import OpenAIEmbeddings
import { CustomDocument } from "../types/CustomDocument";

export class EmbeddingManager {
  private embeddings: OpenAIEmbeddings;

  constructor() {
    // Initialize OpenAIEmbeddings with the text-embedding-3-small model
    this.embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small", // Use the text-embedding-3-small model
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async embedDocuments(docs: CustomDocument[]) {
    // Embed documents using OpenAI's embeddings
    return this.embeddings.embedDocuments(
      docs.map((d) => d.pageContent)
    );
  }

  async embedQuery(query: string) {
    // Embed a single query using OpenAI's embeddings
    return this.embeddings.embedQuery(query);
  }

  getEmbeddingsModel() {
    return this.embeddings;
  }
}