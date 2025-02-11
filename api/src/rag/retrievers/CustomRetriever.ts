import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";
import { EmbeddingManager } from "../embedding/EmbeddingManager";
import { PineconeManager } from "../vector-stores/PineconeManager";

export class CustomRetriever extends VectorStoreRetriever<PineconeStore> {
  private minScore: number;

  constructor(vectorStore: PineconeStore, options: {
    k?: number;
    minScore?: number;
  } = {}) {
    super({
      vectorStore,
      k: options.k || 5,
    });
    this.minScore = options.minScore || 0.0; // Lower threshold to catch more results
  }

  async getRelevantDocuments(query: string): Promise<Document[]> {
    try {
      console.log('\n=== Retrieval Debug Info ===');
      console.log('Query:', query);
      console.log('Retrieving top', this.k, 'documents');

      // Get raw results with scores
      const results = await this.vectorStore.similaritySearchWithScore(query, this.k, {
        includeMetadata: true
      });

      console.log('\nFound', results.length, 'total results');

      if (results.length === 0) {
        console.warn('No documents found in vector store for the query');
        return [];
      }

      // Log detailed results for debugging
      console.log('\nDetailed Results:');
      results.forEach(([doc, score], index) => {
        console.log(`\nDocument ${index + 1}:`);
        console.log(`Score: ${score.toFixed(4)}`);
        console.log(`Content Preview: ${doc.pageContent.substring(0, 100)}...`);
        console.log('Metadata:', JSON.stringify(doc.metadata, null, 2));
      });

      // Filter and transform results
      const filteredDocs = results
        .filter(([_, score]) => {
          const passes = score >= this.minScore;
          if (!passes) {
            console.log(`Filtered out document with score ${score} (below threshold ${this.minScore})`);
          }
          return passes;
        })
        .map(([doc, score]) => new Document({
          pageContent: doc.pageContent,
          metadata: {
            ...doc.metadata,
            score: score,
            retrieval_time: new Date().toISOString()
          }
        }));

      console.log('\nReturning', filteredDocs.length, 'filtered documents');
      console.log('=== End Debug Info ===\n');

      return filteredDocs;

    } catch (error) {
      console.error('Error in getRelevantDocuments:', error);
      throw new Error(`Failed to retrieve documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
