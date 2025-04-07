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

  console.log('[LAMBDA] Incoming event:', JSON.stringify(event, null, 2));

  if (event.path === '/telegram/webhook' && event.httpMethod === 'POST') {
    console.log('[LAMBDA] Processing Telegram webhook');
  
    // ✅ Respond immediately to Telegram
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Telegram webhook received' }),
    };
  }
  

  // 🟢 Handle API Gateway requests
  return new Promise((resolve, reject) => {
    console.log('[API Call]:', {
      path: event.path,
      method: event.httpMethod,
      body: event.body,
      queryParams: event.queryStringParameters
    });

    serverless.proxy(server, event, context, "CALLBACK", (err, res) => {
      if (err) {
        console.error('[API Response Error]:', err);
        return reject(err);
      }
      
      console.log('[API Response]:', {
        path: event.path,
        method: event.httpMethod,
        statusCode: res?.statusCode,
        body: res?.body
      });
      
      resolve(res);
    });
  });
};
