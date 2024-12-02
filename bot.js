const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Main bot token
const mainBotToken = '7638229482:AAEHEk2UNOjAyqA3fxKsf9ZliGSI8941gG4';

// Main bot instance
const bot = new TelegramBot(mainBotToken, {
  polling: true,
  request: {
    rejectUnauthorized: true,
  },
});
bot.stopPollingOnException = true;
TelegramBot.Promise = global.Promise;

// List of unique emojis for reactions
const myEmoji = ["👍", "❤️", "🔥", "💯", "😎", "😂", "🤔", "🤩", "🤡", "🎉", "🎵", "💎", "👑", "🦄", "💖", "🌟", "😜", "🎶", "✨", "💥", "🥳", "🌈", "💌", "🙌", "🌍"];

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const text = `
*Hey, I am a reaction bot\\!*\n
Add me to your group/channel to get emoji reactions\\!\n
To join, click the button below:
  `;

  bot.sendMessage(chatId, text, {
    parse_mode: 'MarkdownV2',
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Join 👋',
          url: 'https://t.me/BABY09_WORLD' // Replace with your channel link
        }]
      ]
    }
  }).catch((error) => {
    console.error("Error sending /start message:", error.message);
  });
});

bot.onText(/\/clone (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const token = match[1].trim();

  try {
    const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
    if (response.data.ok) {
      const botInfo = response.data.result;

      bot.sendMessage(chatId, `✅ Token is valid! Bot "${botInfo.first_name}" is starting...`);

      const clonedBot = new TelegramBot(token, { polling: true });

      clonedBot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const messageId = msg.message_id;

        if (msg.chat.type === 'private' || msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
          const randomEmoji = myEmoji[Math.floor(Math.random() * myEmoji.length)];

          clonedBot.sendMessage(chatId, randomEmoji, {
            reply_to_message_id: messageId,
          }).catch((error) => {
            console.error("Error sending emoji:", error.message);
          });
        }
      });

      console.log(`Cloned bot "${botInfo.first_name}" is running...`);
    } else {
      bot.sendMessage(chatId, '❌ Invalid token. Please try again.');
    }
  } catch (error) {
    bot.sendMessage(chatId, '❌ Invalid token or an error occurred. Please try again later.');
    console.error("Error in /clone command:", error.message);
  }
});

console.log('Main bot is running...');
