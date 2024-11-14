require('dotenv').config();

module.exports = {
  telegramBotTokens: [
    process.env.TELEGRAM_BOT_TOKEN_1,
    process.env.TELEGRAM_BOT_TOKEN_2,
    process.env.TELEGRAM_BOT_TOKEN_3,
    // Add more tokens as needed
  ],
  serverPort: 8000
};
