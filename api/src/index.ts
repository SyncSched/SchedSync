import { APIGatewayProxyEvent, Context } from "aws-lambda";
import serverless from "aws-serverless-express";
import app from "./app";
import { processNotifications } from "./cron/RemainderCron";
import { processUserSchedules } from "./cron/scheduleCron";

const server = serverless.createServer(app);

export const handler = async (event: any, context: Context) => {
  console.log("🔍 Event Received:", JSON.stringify(event, null, 2));

  // 🟢 Handle EventBridge Scheduled Event (Cron Job)
  if (event.source === "aws.scheduler") {
    try {
      // Check which type of scheduled job this is
      const jobType = event.detail?.jobType;
      
      switch (jobType) {
        case 'process-notifications':
          await processNotifications();
          break;
        case 'process-schedules':
          await processUserSchedules();
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
