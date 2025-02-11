// import { CustomPDFLoader } from "./rag/loaders/CustomPDFLoader";
// import { CustomSplitter } from "./rag/splitters/CustomSplitter";
import { PineconeManager } from "../rag/vector-stores/PineconeManager";
// import { CustomRetriever } from "./rag/retrievers/CustomRetriever";
// import { CustomQAChain } from "./rag/chains/CustomQAChain";
import { EmbeddingManager } from "../rag/embedding/EmbeddingManager";
// import { CustomDocument } from "./types/CustomDocument";
// import dotenv from "dotenv";
// import { PineconeDebugger } from "./pineconedebugger";
// import { Ollama } from "@langchain/ollama";
import { RunnableSequence } from "@langchain/core/runnables";
import {formatDocumentsAsString } from "langchain/util/document";
import axios from "axios";






const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://cloud.olakrutrim.com/v1/chat/completions"; // Example URL, check their docs

async function callDeepSeekAPI(prompt: string) {
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "DeepSeek-R1", // Specify the model name
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500, // Adjust as needed
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract and return the generated text
    const result = response.data.choices[0].message.content;
    
    return result;
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    throw error;
  }
}


export const generateSchedule = async (data:string) => {
  try{
      // 3. Initialize Pinecone
      console.log("starting...")
      const pinecone = new PineconeManager("rag-index");
      
      
      //3.5 Initialzie Embedders
      const embeddingsManager = new EmbeddingManager();
      await pinecone.initializeVectorStore(embeddingsManager.getEmbeddingsModel());
      console.log("vector db pinecone setup complete")
      // await pinecone.upsertDocuments(
      //   docs,
      //   embeddingsManager.getEmbeddingsModel()
      // );
      const vectorStore = pinecone.getVectorStore();
      const retriever = vectorStore.asRetriever();
  
      console.log("got retreiver");
  
  
      const question = "Where did Prudvi Raj Study , give me one word answer?";
      const chain = RunnableSequence.from([
        retriever, // Fetch relevant documents
        formatDocumentsAsString, // Convert docs into a string format for context
        async (context: string) => {
          // Predefined question
  
          // Construct the prompt with Context, User Data, and Question
          const prompt = `
            Context: ${context}
            
            User Data: ${data}
            
            Question: ${question}
          `.trim(); // Trim removes extra whitespace
  
          // Send the prompt to the DeepSeek API
          return await callDeepSeekAPI(prompt);
        },
      ]);
    
      
      const result = await chain.invoke(question);
      console.log("Answer:", result);

      return result;
    
  }catch(err){
    console.log("Problem in Schedule generation via RAG");
  }
}



async function main() {
  try {

    // // 1. Load PDF
    
    // const loader = new CustomPDFLoader("documents/GameDeveloper Resume.pdf");
    // const rawDocs = await loader.load();
    // console.log("loading")

    // // // 2. Split documents
    // const splitter = new CustomSplitter();
    // const docs = await splitter.splitDocuments(rawDocs);
    // console.log("splitting")

    // 3. Initialize Pinecone
    console.log("starting...")
    const pinecone = new PineconeManager("rag-index");
    
    
    //3.5 Initialzie Embedders
    const embeddingsManager = new EmbeddingManager();
    await pinecone.initializeVectorStore(embeddingsManager.getEmbeddingsModel());
    console.log("vector db pinecone setup complete")
    // await pinecone.upsertDocuments(
    //   docs,
    //   embeddingsManager.getEmbeddingsModel()
    // );
    const vectorStore = pinecone.getVectorStore();
    const retriever = vectorStore.asRetriever();

    console.log("got retreiver");


    const chain = RunnableSequence.from([
      retriever, // Fetch relevant documents
      formatDocumentsAsString, // Convert docs into a string format for context
      async (context: string) => {
        const prompt = `Context: ${context}\n\nQuestion: I want to hire prudvi raj , so rate him out of 10?`;
        return await callDeepSeekAPI(prompt); // Use DeepSeek API for generation
      },
    ]);
  
    
    const result = await chain.invoke("I want to hire prudvi raj , so rate him out of 10 , don't forget to rate him");
    console.log("Answer:", result);

  } catch (error) {
    console.error("Error:", error);
  }
}

// main();