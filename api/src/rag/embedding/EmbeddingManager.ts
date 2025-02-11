import { OllamaEmbeddings } from "@langchain/ollama";
import { CustomDocument } from "../types/CustomDocument";

export class EmbeddingManager {
  private embeddings: OllamaEmbeddings;

  constructor() {
    this.embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text:latest",
      baseUrl: "http://localhost:11434"
    });
  }

  async embedDocuments(docs: CustomDocument[]) {
    return this.embeddings.embedDocuments(
      docs.map(d => d.pageContent)
    );
  }

  async embedQuery(query: string) {
    return this.embeddings.embedQuery(query);
  }

  getEmbeddingsModel() {
    return this.embeddings;
  }
}