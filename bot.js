const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const mongoose = require('mongoose');

// Main bot token
const mainBotToken = '7638229482:AAEHEk2UNOjAyqA3fxKsf9ZliGSI8941gG4';

// MongoDB connection
mongoose.connect('mongodb+srv://Yash_607:Yash_607@cluster0.r3s9sbo.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schema for storing bot tokens
const botTokenSchema = new mongoose.Schema({
  botName: String,
  token: String
});

const BotToken = mongoose.model('BotToken', botTokenSchema);

// Main bot instance
const bot = new TelegramBot(mainBotToken, { polling: true });

// List of unique emojis for reactions
const myEmoji = ["👍", "❤️", "🔥", "💯", "😎", "😂", "🤔", "🤩", "🤡", "🎉", "💖", "🤯", "🤗", "😜", "🧐", "👻", "🥳", "🥸", "😢", "🥵", "🫣"];

// Function to escape special characters for MarkdownV2
function escapeMarkdownV2(text) {
  return text.replace(/([_*\[\]()~`>#+-=|{}.!])/g, '\\$1');
}

// Command: /start for main bot
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const text = `*Hey, I am a reaction bot!*\n\nAdd me to your group/channel to get emoji reactions!\nTo join, click the button below:`;

  const escapedText = escapeMarkdownV2(text);

  bot.sendMessage(chatId, escapedText, {
    parse_mode: 'MarkdownV2',
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Join 👋',
          url: 'https://t.me/YOUR_CHANNEL_LINK' // Replace with your channel link
        }]
      ]
    }
  }).catch((error) => {
    console.error("Error sending /start message:", error.message);
  });
});

// Polling error handler
bot.on('polling_error', (error) => {
  console.error('Main bot polling error:', error); // Log polling errors
});

// Reaction logic for main bot
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  console.log(`Received message: ${msg.text}, chatId: ${chatId}, messageId: ${messageId}`);

  // Ensure we only react to group or private messages (ignoring any non-message events)
  if (msg.chat.type === 'private' || msg.chat.type === 'group' || msg.chat.type === 'supergroup' || msg.chat.type === 'channel') {
    // Skip if the message is a command or non-reaction message
    if (msg.text && msg.text.startsWith('/')) return;

    // Select a random emoji from the list
    const doEmoji = myEmoji[Math.floor(Math.random() * myEmoji.length)];

    // Send the emoji as a reaction using HTTP POST request
    axios.post(`https://api.telegram.org/bot${mainBotToken}/setMessageReaction`, {
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
      console.log(`Main bot reacted with ${doEmoji} to message: ${msg.text}`);
    })
    .catch(error => {
      console.error(`Error reacting with emoji: ${error}`);
    });
  }
});

// Function to start cloned bots
async function startClonedBots() {
  try {
    // Fetch unique bot tokens from MongoDB
    const storedBots = await BotToken.find();

    storedBots.forEach(botData => {
      const clonedBot = new TelegramBot(botData.token, { polling: { autoStart: false } });
      clonedBot.startPolling(); // Start polling for cloned bot

      // Command: /start for the cloned bot
      clonedBot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const text = `Hi, I am a cloned bot of *${botData.botName}*!`;

        const escapedText = escapeMarkdownV2(text);

        clonedBot.sendMessage(chatId, escapedText, { parse_mode: 'MarkdownV2' })
          .catch(error => console.error("Error sending /start message for cloned bot:", error.message));
      });

      // Reaction logic for cloned bot
      clonedBot.on('message', (msg) => {
        const clonedChatId = msg.chat.id;
        const clonedMessageId = msg.message_id;

        // Skip if the message is a command
        if (msg.text && msg.text.startsWith('/')) return;

        // Select a random emoji from the list
        const clonedEmoji = myEmoji[Math.floor(Math.random() * myEmoji.length)];

        clonedBot.sendMessage(clonedChatId, clonedEmoji, { reply_to_message_id: clonedMessageId })
          .catch(error => {
            console.error(`Error reacting with emoji in cloned bot: ${error}`);
          });
      });

      console.log(`Cloned bot "${botData.botName}" is running...`);
    });
  } catch (error) {
    console.error('Error starting cloned bots:', error.message);
  }
}
// Start all cloned bots
startClonedBots();

// Command: /clone <bot_token>
bot.onText(/\/clone (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const token = match[1].trim();

  try {
    const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
    if (response.data.ok) {
      const botInfo = response.data.result;

      bot.sendMessage(chatId, `✅ Token is valid! Bot "${botInfo.first_name}" is starting...`);

      const newBotToken = new BotToken({
        botName: botInfo.first_name,
        token: token
      });
      await newBotToken.save();

      console.log(`Stored bot token for "${botInfo.first_name}" in MongoDB`);
      startClonedBots();
    } else {
      bot.sendMessage(chatId, '❌ Invalid token. Please try again.');
    }
  } catch (error) {
    bot.sendMessage(chatId, '❌ Invalid token or an error occurred. Please try again.');
    console.error("Error in /clone command:", error.message);
  }
});

console.log('Main bot is running...');
