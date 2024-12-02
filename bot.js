const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Main bot token
const mainBotToken = '7200164571:AAEWrfrsnfSrrbGA0HSKVGAlZlK2vTOuUgI';

// Main bot instance
const bot = new TelegramBot(mainBotToken, { polling: true });

// List of unique emojis for reactions
const myEmoji = ["👍", "❤️", "🔥", "💯", "😎", "😂", "🤔", "🤩", "🤡", "🎉", "🎵", "💎", "👑", "🦄", "💖", "🌟", "😜", "🎶", "✨", "💥", "🥳", "🌈", "💌", "🙌", "🌍"];

// Command: /start
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

// Reaction to messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  // Skip if message is a command
  if (msg.text && msg.text.startsWith('/')) return;

  // Select a random emoji
  const randomEmoji = myEmoji[Math.floor(Math.random() * myEmoji.length)];

  // Send the emoji as a reply
  bot.sendMessage(chatId, randomEmoji, {
    reply_to_message_id: messageId,
  }).catch((error) => {
    console.error("Error sending emoji reaction:", error.message);
  });
});

// Command: /clone <bot_token>
bot.onText(/\/clone (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const token = match[1].trim();

  try {
    // Validate the provided bot token
    const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
    if (response.data.ok) {
      const botInfo = response.data.result;

      bot.sendMessage(chatId, `✅ Token is valid! Bot "${botInfo.first_name}" is starting...`);

      // Create and start the new bot instance
      const clonedBot = new TelegramBot(token, { polling: true });

      // Add reaction logic for the cloned bot
      clonedBot.on('message', (msg) => {
        const clonedChatId = msg.chat.id;
        const clonedMessageId = msg.message_id;

        // Skip if message is a command
        if (msg.text && msg.text.startsWith('/')) return;

        const clonedEmoji = myEmoji[Math.floor(Math.random() * myEmoji.length)];

        clonedBot.sendMessage(clonedChatId, clonedEmoji, {
          reply_to_message_id: clonedMessageId,
        }).catch((error) => {
          console.error("Error sending emoji reaction in cloned bot:", error.message);
        });
      });

      console.log(`Cloned bot "${botInfo.first_name}" is running...`);
    } else {
      bot.sendMessage(chatId, '❌ Invalid token. Please try again.');
    }
  } catch (error) {
    bot.sendMessage(chatId, '❌ Invalid token or an error occurred. Please try again.');
    console.error("Error in /clone command:", error.message);
  }
});

console.log('Main bot is running...');
