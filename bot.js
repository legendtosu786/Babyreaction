const config = require('./config');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const app = express();

// Emojis for reactions
const myEmoji = [
  "👍", "❤", "🔥", "🥰", "👏", "😁", "🤔", "🤯", "😱", "🎉", "🤩", "🙏", "👌", "😍", 
  "❤‍🔥", "🌚", "💯", "🤣", "💔", "🇮🇳", "😈", "😭", "🤓", "😇", "🤝", "🤗", "🫡", 
  "🤪", "🗿", "🆒", "💘", "😘", "😎"
];

// Get the list of bot tokens from config
const tokens = config.telegramBotTokens;

// Create an array of bot instances
const bots = tokens.map((token, index) => new TelegramBot(token, { polling: true }));

// For each bot, set up the necessary handlers
bots.forEach((bot, index) => {

  // /start command handler
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const text = `
      *Hey, I am bot ${index + 1}!*\n
      ~Add me to your group/channel to get emoji reactions!~\n
      To join, click the button below 👇
    `;

    bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown', 
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Join 👋',
            url: 'https://t.me/BABY09_WORLD'  // Replace with your desired link
          }]
        ]
      }
    });
  });

  // Polling error handler
  bot.on('polling_error', (error) => {
    console.error(`Polling error for Bot ${index + 1}:`, error);
  });

  // Handle all incoming messages and react with an emoji
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    if (msg.chat.type === 'private' || msg.chat.type === 'group' || msg.chat.type === 'supergroup' || msg.chat.type === 'channel') {
      const randomEmoji = myEmoji[Math.floor(Math.random() * myEmoji.length)];

      // Send reaction
      axios.post(`https://api.telegram.org/bot${tokens[index]}/setMessageReaction`, {
        chat_id: chatId,
        message_id: messageId,
        reaction: JSON.stringify([
          {
            type: "emoji",
            emoji: randomEmoji,
            is_big: true  // Make emoji bigger
          }
        ])
      })
      .then(response => {
        console.log(`Bot ${index + 1} reacted with ${randomEmoji} to message: ${msg.text}`);
      })
      .catch(error => {
        console.error(`Error reacting with emoji for Bot ${index + 1}:`, error);
      });
    }
  });

  // Keep the bot alive by checking its status every 5 minutes
  setInterval(() => {
    bot.getMe().then((data) => {
      console.log(`Bot ${index + 1} is still connected:`, data);
    }).catch((error) => {
      console.error(`Error keeping Bot ${index + 1} alive:`, error);
    });
  }, 1000 * 60 * 5); // Check every 5 minutes

});

console.log('All bots are running...');

// Set up Express server
app.get('/', (req, res) => {
  res.send('All bots are running on port 8000');
});

// Start the Express server on the port from config
app.listen(config.serverPort, () => {
  console.log(`Server is running on port ${config.serverPort}`);
});
