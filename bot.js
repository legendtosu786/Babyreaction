// Load the config file
const config = require('./config');

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const app = express();

// Use the bot token from the config file
const token = config.telegramBotToken;

// Create a new bot instance
const bot = new TelegramBot(token, { polling: true });

// List of emojis to react with
const myEmoji = [
  "👍", "❤", "🔥", "🥰", "👏", "😁", "🤔", "🤯", "😱", "🎉", "🤩", "🙏", "👌", "😍", 
  "❤‍🔥", "🌚", "💯", "🤣", "💔", "🇮🇳", "😈", "😭", "🤓", "😇", "🤝", "🤗", "🫡", 
  "🤪", "🗿", "🆒", "💘", "😘", "😎"
];

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const text = `
  *Hey, I am a reaction bot!*\n
  ~Add me to your group/channel to get emoji reactions!~\n
  To join, click the button below 👇
  `;

  // Send a message with Markdown styling and an inline button with the link
  bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown', // Enable Markdown formatting
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Join 👋',
          url: 'https://t.me/BABY09_WORLD' // Replace with your channel link
        }]
      ]
    }
  });
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error); // Log the polling error
});

// Listen for new messages and send a random emoji as a reaction
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  // Ensure we only react to group or private messages (ignoring any non-message events)
  if (msg.chat.type === 'private' || msg.chat.type === 'group' || msg.chat.type === 'supergroup' || msg.chat.type === 'channel') {
    // Select a random emoji from the list
    const doEmoji = myEmoji[Math.floor(Math.random() * myEmoji.length)];

    // Send the emoji as a reaction using HTTP POST request
    axios.post(`https://api.telegram.org/bot${token}/setMessageReaction`, {
      chat_id: chatId,
      message_id: messageId,
      reaction: JSON.stringify([
        {
          type: "emoji",
          emoji: doEmoji,
          is_big: true // Optional: To make the reaction big (true/false)
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

// Keep the bot alive by pinging Telegram every 5 minutes
setInterval(() => {
  bot.getMe().then((data) => {
    console.log('Bot is still connected', data);
  }).catch((error) => {
    console.error('Error keeping the bot alive', error);
  });
}, 1000 * 60 * 5); // Check every 5 minutes

// Set up a basic Express server to listen on port 8000
app.get('/', (req, res) => {
  res.send('Bot is running on port 8000');
});

// Start the server on the port defined in config
app.listen(config.serverPort, () => {
  console.log(`Server is running on port ${config.serverPort}`);
});
