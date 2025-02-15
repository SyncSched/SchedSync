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
import { formatDocumentsAsString } from "langchain/util/document";
import axios from "axios";
import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "langchain/document";

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


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function callOpenAIAPI(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      // model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500, // Adjust as needed
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

async function callGeminiAPI(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use Gemini 2.0 Flash

    const response = await model.generateContent(prompt);
    const result = await response.response;
    
    return result.text(); // Extract the generated text
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}


export const storeDailySchedules = async (userId: string, scheduleData: string) => {
  try {
    const pinecone = new PineconeManager("rag-index");
    const embeddingsManager = new EmbeddingManager();
    await pinecone.initializeVectorStore(embeddingsManager.getEmbeddingsModel());
    
    // Check if schedule exists for today
    const vectorStore = pinecone.getVectorStore();
    const today = new Date().toISOString().split('T')[0];
    const existingSchedules = await vectorStore.similaritySearch(
      `userId:${userId} date:${today}`,
      1
    );

    if (existingSchedules.length > 0) {
      console.log(`Schedule already exists for user ${userId} on ${today}`);
      return false;
    }

    // Create a new document with metadata including source
    const doc = new Document({
      pageContent: scheduleData,
      metadata: {
        userId: userId,
        date: today,
        type: 'daily_schedule',
        source: 'user_schedule' // Added required source property
      }
    });

    // Store the document
    await pinecone.upsertDocuments(
      [doc],
      embeddingsManager.getEmbeddingsModel()
    );

    console.log(`Successfully stored schedule for user ${userId} on ${today}`);
    return true;
  } catch (error) {
    console.error("Error storing daily schedule:", error);
    throw error;
  }
};


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
  
  
      const question = `
      Generate a complete daily schedule based on the provided user data, profession, and personal preferences.
      
      ### **Schedule Requirements:**
      1. The schedule must **cover all time slots in the day except sleep time**.
      2. Activities should be structured logically with appropriate time slots and durations.
      3. Work hours should match the user’s profession and can be flexible.
      4. Free time should include personal hobbies, meals, and relaxation.
      5. **NO overlapping time slots.**
      6. Ensure a balanced distribution of work, breaks, and personal time.
      7. Each schedule should be unique, varying in time slots, activity order, and work session length.
      
      ### **Output Format:**
      The response must be a **valid JSON array** with each entry containing:
      - "name": The name of the activity.
      - "time": The start time in **HH:MM** format (24-hour format).
      - "duration": The duration in **minutes**.
      
      ### **Strict Output Rules:**
      1. **Return ONLY the JSON array**. Do NOT include explanations, reasoning, or additional text.
      2. Ensure valid JSON syntax.
      3. The schedule must be **fully structured**, covering all available hours except sleep time.
      4. Each generated schedule must be unique and adapted to the user's profession and personal routines.
      
      **Return only the JSON array and nothing else.**
      `;
      
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
          // return await callDeepSeekAPI(prompt);
          // return await callOpenAIAPI(prompt);
          return await callGeminiAPI(prompt);
        },
      ]);
    
      
      const result = await chain.invoke(question);
      console.log("Answer:", result);

      return result;
    
  }catch(err){
    console.log("Problem in Schedule generation via RAG",err);
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