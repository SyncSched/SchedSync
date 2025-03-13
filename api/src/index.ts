import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import serverless from 'aws-serverless-express';
import app from './app';
import { processNotifications } from './cron/RemainderCron';

const server = serverless.createServer(app);

export const handler = async (event: any, context: Context) => {
  console.log('🔍 Event Received:', JSON.stringify(event, null, 2));

  if(event.source === "aws.scheduler"){
    return await processNotifications();
  }
  return serverless.proxy(server, event, context);
};
