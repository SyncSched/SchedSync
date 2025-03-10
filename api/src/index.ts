import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import serverless from 'aws-serverless-express';
import app from './app';
import { processNotifications } from './cron/RemainderCron';

const server = serverless.createServer(app);

export const handler = async (event: any, context: Context) => {
  if (event.source === 'aws.events') {
    console.log('🔔 Scheduled Event Triggered by EventBridge');
    await processNotifications(); // Run cron job logic
    return { statusCode: 200, body: 'Notifications processed' };
  }

  // Default API Gateway request handling
  return serverless.proxy(server, event, context);
};
