import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import serverless from 'aws-serverless-express';
import app from './app';

const server = serverless.createServer(app);

export const handler = (event: APIGatewayProxyEvent, context: Context) => {
  console.log('🔍 Event Received:', JSON.stringify(event, null, 2));
  return serverless.proxy(server, event, context);
};
