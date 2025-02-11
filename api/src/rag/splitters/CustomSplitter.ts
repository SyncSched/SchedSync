import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CustomDocument } from "../types/CustomDocument";

export class CustomSplitter extends RecursiveCharacterTextSplitter {
  constructor() {
    super({
      chunkSize: 1000,
      chunkOverlap: 200
    });
  }

  async splitDocuments(docs: CustomDocument[]): Promise<CustomDocument[]> {
    const baseDocs = await super.splitDocuments(docs);
    return baseDocs.map(doc => ({
      pageContent: doc.pageContent,
      metadata: {
        source: "my-pdf", // Explicitly set your custom field
        ...doc.metadata // Preserve other metadata
      }
    })) as CustomDocument[]; // Tell TypeScript "trust me, these are CustomDocuments"
  }
}