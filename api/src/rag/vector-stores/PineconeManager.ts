import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { CustomDocument } from "../types/CustomDocument";

export class PineconeManager {
  private pinecone: Pinecone;
  private indexName: string;
  private vectorStore: PineconeStore | null = null;

  constructor(indexName: string) {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    this.indexName = indexName;
  }

  async initializeVectorStore(embeddings: any) {
    const index = this.pinecone.Index(this.indexName);
    this.vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: "rag"
    });
  }

  async upsertDocuments(docs: CustomDocument[], embeddings: any) {
    const index = this.pinecone.Index(this.indexName);
    this.vectorStore = await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: "rag"
    });
  }

  async queryIndex(queryEmbedding: number[], k: number = 4) {
    const index = this.pinecone.Index(this.indexName);
    return await index.query({
      vector: queryEmbedding,
      topK: k,
      includeMetadata: true,
      includeValues: false
    });
  }

  async getIndexStats() {
    const index = this.pinecone.Index(this.indexName);
    return await index.describeIndexStats();
  }

  async getIndex(){
    return this.pinecone.Index(this.indexName);
  }

  getVectorStore(): PineconeStore {
    if (!this.vectorStore) throw new Error("Initialize vector store first!");
    return this.vectorStore;
  }
  
}