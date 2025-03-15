import { APIGatewayProxyEvent, Context } from "aws-lambda";
import serverless from "aws-serverless-express";
import app from "./app";
import { processNotifications } from "./cron/RemainderCron";

const server = serverless.createServer(app);

export const handler = async (event: any, context: Context) => {
  console.log("🔍 Event Received:", JSON.stringify(event, null, 2));

  // 🟢 Handle EventBridge Scheduled Event (Cron Job)
  if (event.source === "aws.scheduler") {
    try {
      await processNotifications();
      return { statusCode: 200, body: JSON.stringify({ message: "Cron job executed successfully" }) };
    } catch (error) {
      console.error("❌ Error in cron job:", error);
      return { statusCode: 500, body: JSON.stringify({ error: "Cron job execution failed" }) };
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
