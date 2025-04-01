// import { CustomPDFLoader } from "./rag/loaders/CustomPDFLoader";
// import { CustomSplitter } from "./rag/splitters/CustomSplitter";
import { PineconeManager } from "../rag/vector-stores/PineconeManager";
// import { CustomRetriever } from "./rag/retrievers/CustomRetriever";
// import { CustomQAChain } from "./rag/chains/CustomQAChain";
// import { EmbeddingManager } from "../rag/embedding/EmbeddingManager";
import { EmbeddingManager } from "../rag/embedding/OpenAIEmbedding";
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


// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// async function callOpenAIAPI(prompt: string) {
//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo", 
//       // model: "gpt-4",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.7,
//       max_tokens: 500, // Adjust as needed
//     });

//     return response.choices[0].message.content;
//   } catch (error) {
//     console.error("Error calling OpenAI API:", error);
//     throw error;
//   }
// }


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

      Generate a complete daily schedule based on the provided user data, context, and profession. The schedule must align with the user's work hours, personal preferences, and hobbies while ensuring a well-balanced routine.  

### **Schedule Requirements:**  
1. The schedule must **cover all available hours except sleep time**, strictly following the user's sleeping hours from the provided user data.  
2. **Do NOT explicitly include tasks like "Sleep Start" or "Go to Sleep."**
3. Each task must have a **reasonable duration**:
   - Work sessions: Maximum 180 minutes (3 hours) before a break
   - Meals: 15-60 minutes
   - Breaks: 15-30 minutes
   - Other activities: Maximum 120 minutes
4. Work hours must be divided into focused sessions with breaks in between
5. Include standard daily activities like meals, commute, and personal care
6. **STRICT: NO OVERLAPPING TIMES - Each task must end before the next begins**
7. **STRICT: Calculate end time (start time + duration) before assigning the next task**
8. The schedule should be balanced between work, breaks, and personal time
9. **All durations must be between 1 and 180 minutes**
10. Ensure proper meal times: breakfast (6-9 AM), lunch (12-2 PM), dinner (6-8 PM)

### **Output Format:**  
Return a JSON array where each object MUST contain:
- "name": Activity name (string)
- "time": Start time (HH:mm format, 24-hour)
- "duration": Length in minutes (integer between 1-180)

### **Validation Rules:**  
1. For each task, verify: next_task.time >= (current_task.time + current_task.duration)
2. No single task duration > 180 minutes
3. No gaps between tasks (next task starts when previous ends)
4. Time format must be "HH:mm" (e.g., "09:00", "14:30")
5. All times must be chronologically ordered
6. Duration must be a positive integer

### **Example of Correct Time Calculation:**
If Task A: {time: "09:00", duration: 30}
Then Task B must have: {time: "09:30"} or later

**Return ONLY the JSON array with no additional text or explanation.**


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
          console.log(prompt)
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
