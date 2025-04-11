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
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const response = await model.generateContent(prompt);
    const result = await response.response;

    return result.text(); // Extract the generated text
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}


export const storeDailySchedules = async (
  userId: string,
  scheduleData: string,
  user: any // Replace 'any' with your User type
) => {
  try {
    const pinecone = new PineconeManager("rag-index");
    const embeddingsManager = new EmbeddingManager();
    await pinecone.initializeVectorStore(embeddingsManager.getEmbeddingsModel());

    // Check if schedule exists for today
    const vectorStore = pinecone.getVectorStore();
    const today = new Date().toISOString().split('T')[0];
    // We should search based on the actual schedule content
    const existingSchedules = await vectorStore.similaritySearchWithScore(
      scheduleData,  // Search using the actual schedule content
      1,
      {
        userId: userId,
        date: today,
        type: 'daily_schedule',
      }
    );

    // existingSchedules will be an array of tuples: [document, score]
    // Example usage:
    if (existingSchedules.length > 0) {
      const [doc, score] = existingSchedules[0];
      console.log(`Schedule already exists for user ${userId} on ${today} with similarity score: ${score}`);
      return false;
    }

    // Create a new document with metadata including source
    const doc = new Document({
      pageContent: scheduleData,
      metadata: {
        userId: userId,
        date: today,
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }), // e.g., "Monday"
        type: 'daily_schedule',
        source: 'user_schedule',
        // User-specific context
        profession: user.onboardingData?.profession,
        workingHours: user.onboardingData?.workingHours,
        workingStart: user.onboardingData?.workingStart,
        workingEnd: user.onboardingData?.workingEnd,
        sleepingHours: user.onboardingData?.sleepingHours,
        sleepingStart: user.onboardingData?.sleepingStart,
        sleepingEnd: user.onboardingData?.sleepingEnd,
        timezone: user.timezone,
        // Additional context
        isWorkday: !['Saturday', 'Sunday'].includes(new Date().toLocaleDateString('en-US', { weekday: 'long' })),
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


export const generateSchedule = async ( user: any) => {
  try {
    console.log("starting...")
    const pinecone = new PineconeManager("rag-index");
    const embeddingsManager = new EmbeddingManager();
    await pinecone.initializeVectorStore(embeddingsManager.getEmbeddingsModel());
    console.log("vector db pinecone setup complete");
    const vectorStore = pinecone.getVectorStore();
    // Customize retriever to get more relevant documents
    const retriever = vectorStore.asRetriever({
      k: 5,
      // filter: {
      //   userId: user.id,
      //   profession: user.onboardingData?.profession,
      //   dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
      // }
    });
    console.log("got retreiver");
    // Check if there are calendar events to include
    const hasCalendarEvents = user.calendarEvents && Array.isArray(user.calendarEvents) && user.calendarEvents.length > 0;

    // Debug log to verify calendar events in workflow
    console.log('Workflow received user data with calendar events:',
      hasCalendarEvents ? `${user.calendarEvents.length} events found` : 'No events found',
      hasCalendarEvents ? user.calendarEvents.map((event: any) => ({ name: event.name, time: event.time })) : []);

    // Format calendar events for the prompt if they exist
    let calendarEventsSection = '';
    if (hasCalendarEvents) {
      calendarEventsSection = `
      ### **Google Calendar Events (MUST INCLUDE):**
      The following events from the user's Google Calendar MUST be included in the schedule exactly as specified:
      ${user.calendarEvents.map((event: any, index: number) => `
      ${index + 1}. "${event.name}" at ${event.time} for ${event.duration} minutes${event.location ? ` at ${event.location}` : ''}`).join('')}
      `;
    }

    const question = `
      Generate a complete daily schedule for a ${user.onboardingData?.profession} on ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}.

      ### **User Profile:**
      - Profession: ${user.onboardingData?.profession}
      - Working Hours: ${user.onboardingData?.workingHours} hours (${user.onboardingData?.workingStart} - ${user.onboardingData?.workingEnd})
      - Sleeping Hours: ${user.onboardingData?.sleepingHours} hours (${user.onboardingData?.sleepingStart} - ${user.onboardingData?.sleepingEnd})
      - Timezone: ${user.timezone}
      - Hobbies: ${user.onboardingData?.hobbies.join(', ')}
      ${calendarEventsSection}

      ### **Schedule Requirements:**
      1. The schedule must **cover all available hours except sleep time**, strictly following the user's sleeping hours from ${user.onboardingData?.sleepingStart} to ${user.onboardingData?.sleepingEnd}.
      2. **Do NOT explicitly include tasks like "Sleep Start" or "Go to Sleep."**
      3. Each task must have a **reasonable duration**:
         - Work sessions: Maximum 180 minutes (3 hours) before a break
         - Meals: 15-60 minutes
         - Breaks: 15-30 minutes
         - Other activities: Maximum 120 minutes
      4. Work hours must be scheduled between ${user.onboardingData?.workingStart} - ${user.onboardingData?.workingEnd}
      5. Include standard daily activities like meals, commute, and personal care
      6. **STRICT: NO OVERLAPPING TIMES - Each task must end before the next begins**
      7. **STRICT: Calculate end time (start time + duration) before assigning the next task**
      8. The schedule should be balanced between work, breaks, and personal time
      9. **All durations must be between 1 and 180 minutes**
      10. Ensure proper meal times: breakfast (6-9 AM), lunch (12-2 PM), dinner (6-8 PM)
      ${hasCalendarEvents ? '11. **CRITICAL: ALL Google Calendar events MUST be included exactly as specified**' : ''}

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
      ${hasCalendarEvents ? '7. All Google Calendar events must be included with exact name, time, and duration' : ''}

      **Return ONLY the JSON array with no additional text or explanation.**
    `;

    const chain = RunnableSequence.from([
      retriever,
      formatDocumentsAsString,
      async (context: string) => {
        const prompt = `
          Context: ${context}

          Question: ${question}
        `.trim();
         console.log(prompt)
        return await callGeminiAPI(prompt);
      },
    ]);

    const result = await chain.invoke(question);
    console.log(result);
    return result;

  } catch(err) {
    console.log("Problem in Schedule generation via RAG", err);
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
