const config = require('./config');

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const app = express();

const token = config.telegramBotToken;

const bot = new TelegramBot(token, { polling: true });

const myEmoji = [
  "👍", "❤", "🔥", "🥰", "👏", "😁", "🤔", "🤯", "😱", "🎉", "🤩", "🙏", "👌", "😍", 
  "❤‍🔥", "🌚", "💯", "🤣", "💔", "🇮🇳", "😈", "😭", "🤓", "😇", "🤝", "🤗", "🫡", 
  "🤪", "🗿", "🆒", "💘", "😘", "😎"
];

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const text = `
  *Hey, I am a reaction bot!*\n
  ~Add me to your group/channel to get emoji reactions!~\n
  To join, click the button below 👇
  `;

  bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown', 
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Join 👋',
          url: 'https://t.me/BABY09_WORLD' 
        }]
      ]
    }
  });
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  if (msg.chat.type === 'private' || msg.chat.type === 'group' || msg.chat.type === 'supergroup' || msg.chat.type === 'channel') {
    const doEmoji = myEmoji[Math.floor(Math.random() * myEmoji.length)];

    axios.post(`https://api.telegram.org/bot${token}/setMessageReaction`, {
      chat_id: chatId,
      message_id: messageId,
      reaction: JSON.stringify([
        {
          type: "emoji",
          emoji: doEmoji,
          is_big: true 
        }
      ])
    })
    .then(response => {
      console.log(`Reacted with ${doEmoji} to message: ${msg.text}`);
    })
    .catch(error => {
      console.error(`Error reacting with emoji: ${error}`);
    });
  }
});

console.log('Bot is running...');

setInterval(() => {
  bot.getMe().then((data) => {
    console.log('Bot is still connected', data);
  }).catch((error) => {
    console.error('Error keeping the bot alive', error);
  });
}, 1000 * 60 * 5); 

app.get('/', (req, res) => {
  res.send('Bot is running on port 8000');
});

app.listen(config.serverPort, () => {
  console.log(`Server is running on port ${config.serverPort}`);
});
