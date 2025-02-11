import { Document as LangchainDocument } from "@langchain/core/documents";

export type CustomDocument = LangchainDocument<{
  source: string;
  [key: string]: any;
}>;