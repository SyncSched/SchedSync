# Telegram Bot Integration Guide

## Bot Information
- Bot Username: @SchedSyncBot
- Bot Token: Use `process.env.TELEGRAM_BOT_TOKEN` from your environment variables

## Webhook Management

### 1. Check Current Webhook Status
```bash
curl https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo
```

### 2. Set Webhook
You can set the webhook using either of these methods:

#### Method 1: Using the Script
Run the `setup-telegram-webhook.js` script:
```bash
node setup-telegram-webhook.js
```

#### Method 2: Direct API Call
```bash
curl -X POST \
  https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://jtxg13v8e1.execute-api.us-east-1.amazonaws.com/default/telegram/webhook",
    "allowed_updates": ["message", "callback_query"],
    "drop_pending_updates": true
  }'
```

### 3. Delete Webhook
If you need to remove the webhook:
```bash
curl https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook
```

## Webhook Configuration

The webhook is configured to:
- Endpoint: `https://jtxg13v8e1.execute-api.us-east-1.amazonaws.com/default/telegram/webhook`
- Allowed Updates: `message` and `callback_query`
- Auto-drop pending updates when setting webhook

## Local Development

For local development:
1. The bot uses polling instead of webhooks
2. Set `NODE_ENV=development` in your environment
3. The bot will automatically switch to polling mode
4. Ensure `TELEGRAM_BOT_TOKEN` is set in your `.env.development` file

## Troubleshooting

### Common Issues:
1. **Webhook Not Working**
   - Verify webhook URL using getWebhookInfo
   - Check API Gateway logs
   - Ensure Lambda function is properly configured

2. **Invalid SSL Certificate**
   - API Gateway must use HTTPS
   - Certificate must be valid and trusted by Telegram

3. **Messages Not Received**
   - Check webhook status
   - Verify bot permissions
   - Check Lambda function logs

### Useful Commands
```bash
# Get bot information
curl https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe

# Get webhook info
curl https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo

# Delete webhook
curl https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook
```

## Security Considerations

1. Keep the bot token secure and never commit it to version control
2. Use environment variables for sensitive data
3. Implement rate limiting in your webhook endpoint
4. Validate incoming updates from Telegram

## Environment Setup

1. Create a `.env.development` file in the root directory
2. Add your Telegram bot token:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

## Additional Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Webhooks vs Long Polling](https://core.telegram.org/bots/webhooks)
- [Bot Security Guidelines](https://core.telegram.org/bots/security)
