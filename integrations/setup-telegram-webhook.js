import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_GATEWAY_URL = 'https://jtxg13v8e1.execute-api.us-east-1.amazonaws.com/default/telegram/webhook'; //SchedSync

async function setupWebhook() {
  try {
    // First, get current webhook info
    const getWebhookInfo = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    console.log('Current webhook info:', getWebhookInfo.data);

    // Set the new webhook
    const setWebhookResponse = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        params: {
          url: API_GATEWAY_URL,
          allowed_updates: ['message', 'callback_query'],
          drop_pending_updates: true
        }
      }
    );

    if (setWebhookResponse.data.ok) {
      console.log('Webhook set successfully!');
      console.log('Response:', setWebhookResponse.data);
    } else {
      console.error('Failed to set webhook:', setWebhookResponse.data);
    }
  } catch (error) {
    console.error('Error setting webhook:', error.response?.data || error.message);
  }
}

setupWebhook();