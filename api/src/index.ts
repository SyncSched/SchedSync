import { APIGatewayProxyEvent, Context } from "aws-lambda";
import serverless from "aws-serverless-express";
import app from "./app";
import { processNotifications } from "./cron/RemainderCron";
import { processUserSchedules } from "./cron/scheduleCron";

const server = serverless.createServer(app);

export const handler = async (event: any, context: Context) => {
  console.log("🔍 Event Received:", JSON.stringify(event, null, 2));

  // Check directly for jobType in the event
  const jobType = event.jobType;
  if (jobType) {
    try {
      console.log(`Executing scheduled job of type: ${jobType}`);
      
      switch (jobType) {
        case 'process-notifications':
          await processNotifications();
          console.log("Notifications processed successfully");
          break;
        case 'process-schedules':
          await processUserSchedules();
          console.log("Schedules processed successfully");
          break;
        default:
          console.warn(`Unknown job type: ${jobType}`);
          return { 
            statusCode: 400, 
            body: JSON.stringify({ error: `Unknown job type: ${jobType}` }) 
          };
      }
      
      return { 
        statusCode: 200, 
        body: JSON.stringify({ message: "Scheduled job executed successfully" }) 
      };
    } catch (error) {
      console.error("❌ Error in scheduled job:", error);
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "Scheduled job execution failed" }) 
      };
    }
  }

  // 🟢 Handle API Gateway requests
  return new Promise((resolve, reject) => {
    serverless.proxy(server, event, context, "CALLBACK", (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};
