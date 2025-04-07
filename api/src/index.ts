import { APIGatewayProxyEvent, Context } from "aws-lambda";
import serverless from "aws-serverless-express";
import app from "./app";
import { processNotifications } from "./cron/RemainderCron";
import { processUserSchedules } from "./cron/scheduleCron";

const server = serverless.createServer(app);

export const handler = async (event: any, context: Context) => {

  // Check directly for jobType in the event
  const jobType = event.jobType;
  if (jobType) {
    try {
      
      switch (jobType) {
        case 'process-notifications':
          await processNotifications();
          break;
        case 'process-schedules':
          await processUserSchedules();
          break;
        default:
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
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "Scheduled job execution failed" }) 
      };
    }
  }

  if (event.path === '/telegram/webhook' && event.httpMethod === 'POST') {
    console.log('[LAMBDA] Processing Telegram webhook');
  }

  // 🟢 Handle API Gateway requests
  return new Promise((resolve, reject) => {
    serverless.proxy(server, event, context, "CALLBACK", (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};
