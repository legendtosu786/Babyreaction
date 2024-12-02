const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const mongoose = require('mongoose');

// Main bot token
const mainBotToken = '7638229482:AAEHEk2UNOjAyqA3fxKsf9ZliGSI8941gG4';
// Define the owner ID (replace with your Telegram user ID)
const ownerId = 7400383704; // Replace with your Telegram ID
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
    const storedBots = await BotToken.aggregate([
      { $group: { _id: "$token", botName: { $first: "$botName" } } }
    ]);

    storedBots.forEach(botData => {
      const clonedBot = new TelegramBot(botData._id, { polling: true });

      // Command: /start for the cloned bot
      clonedBot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const text = `Hi, I am a cloned bot of *${botData.botName}*! \n\nI will react to your messages with random emojis.`;

        const escapedText = escapeMarkdownV2(text);

        clonedBot.sendMessage(chatId, escapedText, { parse_mode: 'MarkdownV2' })
          .catch(error => console.error("Error sending /start message for cloned bot:", error.message));
      });

      // Reaction logic for cloned bot
      clonedBot.on('message', (msg) => {
        const clonedChatId = msg.chat.id;
        const clonedMessageId = msg.message_id;

        console.log(`Cloned bot received message: ${msg.text}, chatId: ${clonedChatId}, messageId: ${clonedMessageId}`);

        // Skip if message is a command or non-reaction message
        if (msg.text && msg.text.startsWith('/')) return;

        // Select a random emoji from the list
        const clonedEmoji = myEmoji[Math.floor(Math.random() * myEmoji.length)];

        // Send emoji as a reaction using setMessageReaction API for cloned bot
        axios.post(`https://api.telegram.org/bot${botData._id}/setMessageReaction`, {
          chat_id: clonedChatId,
          message_id: clonedMessageId,
          reaction: JSON.stringify([
            {
              type: "emoji",
              emoji: clonedEmoji,
              is_big: true // Optional: To make the reaction big (true/false)
            }
          ])
        })
        .then(response => {
          console.log(`Cloned bot reacted with ${clonedEmoji} to message: ${msg.text}`);
        })
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

// Command: /del <bot_token> to delete a cloned bot
// Object to keep track of cloned bot instances
const clonedBots = {};

// Command: /del <bot_token> to delete a cloned bot and stop it
bot.onText(/\/del (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const token = match[1].trim(); // Extract the token from the command
  
  // Check if the command is sent by the owner
  if (msg.from.id !== ownerId) {
    bot.sendMessage(chatId, '❌ You are not authorized to use this command.');
    return;
  }

  try {
    // Find the bot in the database using the provided token
    const botToDelete = await BotToken.findOne({ token: token });

    if (!botToDelete) {
      bot.sendMessage(chatId, '❌ No bot found with this token.');
      return;
    }

    // Delete the bot from the database
    await BotToken.deleteOne({ token: token });

    // Stop the cloned bot polling
    if (clonedBots[token]) {
      clonedBots[token].stopPolling(); // Stop the polling for the cloned bot
      delete clonedBots[token]; // Remove the bot instance from the cloned bots object
    }

    // Send feedback to the owner
    bot.sendMessage(chatId, `✅ The bot "${botToDelete.botName}" has been deleted successfully and stopped.`);
    
    console.log(`Deleted and stopped bot "${botToDelete.botName}" with token ${token}`);
  } catch (error) {
    console.error("Error in /del command:", error.message);
    bot.sendMessage(chatId, '❌ An error occurred while deleting the bot. Please try again.');
  }
});

bot.onText(/\/cloned/, async (msg) => {
  const chatId = msg.chat.id;

  console.log("Received /cloned command from user:", msg.from.id);

  // Check if the command is sent by the owner
  if (msg.from.id !== ownerId) {
    console.log("Unauthorized user attempted to use /cloned command:", msg.from.id);
    bot.sendMessage(chatId, '❌ You are not authorized to use this command.');
    return;
  }

  try {
    console.log("Fetching cloned bots from the database...");
    const storedBots = await BotToken.find();

    if (storedBots.length === 0) {
      console.log("No cloned bots found in the database.");
      bot.sendMessage(chatId, 'No cloned bots found in the database.');
      return;
    }

    console.log(`Found ${storedBots.length} cloned bots.`);

    // Send bots in chunks to avoid message size issues
    const chunkSize = 10; // Number of bots per message
    for (let i = 0; i < storedBots.length; i += chunkSize) {
      const chunk = storedBots.slice(i, i + chunkSize);

      // Prepare the list of bots using newlines for line breaks
      const botList = chunk.map((bot, index) => {
        const botName = bot.botName;
        const token = bot.token;

        // Using \n instead of <br> for line breaks
        return `<b>${i + index + 1}. Bot Name:</b> ${botName}\n<b>Token:</b> <code>${token}</code>`;
      }).join('\n\n'); // Adding \n for space between entries

      const message = `<b>List of Cloned Bots:</b>\n\n${botList}`;
      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
        .catch(error => console.error("Error sending /cloned response:", error.message));
    }
  } catch (error) {
    console.error("Error fetching cloned bots from database:", error.message);
    bot.sendMessage(chatId, 'An error occurred while fetching the cloned bots. Please try again later.');
  }
});


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

// Periodic cleanup of duplicate tokens in the database
async function cleanupDuplicateTokens() {
  try {
    console.log('Cleaning up duplicate tokens...');

    // Find all unique tokens in the database
    const tokens = await BotToken.find().distinct('token');

    // Iterate over the tokens and delete duplicates
    for (let token of tokens) {
      const duplicates = await BotToken.find({ token });

      // If there are more than one entry for the token, delete the extra ones
      if (duplicates.length > 1) {
        const keepBot = duplicates[0]; // Keep the first one
        const duplicateBots = duplicates.slice(1); // All others are duplicates

        // Remove the duplicate bots from the database
        await BotToken.deleteMany({ _id: { $in: duplicateBots.map(bot => bot._id) } });

        console.log(`Removed ${duplicateBots.length} duplicate(s) for token: ${token}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up duplicate tokens:', error.message);
  }
}

// Run the cleanup function every 10 minutes (600,000 milliseconds)
setInterval(cleanupDuplicateTokens, 600000); // Cleanup every 10 minutes

console.log('Main bot is running...');
