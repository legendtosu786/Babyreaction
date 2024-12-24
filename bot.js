const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const axios = require('axios');

// Replace with your bot's token
const token = '7678222033:AAF16gzf4k3sBtFCCb31nRlCW7yJ_QO8vsU';
const bot = new TelegramBot(token, { polling: true });

// Replace with your bot owner's user ID
const ownerId = 7520092354; // Replace with your actual Telegram user ID

// MongoDB Connection
mongoose.connect('mongodb+srv://Yash_607:Yash_607@cluster0.r3s9sbo.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// MongoDB Schema for BotToken
const botTokenSchema = new mongoose.Schema({
  botName: String,
  token: String,
  userId: Number, // The user ID of the owner of the cloned bot
});

const BotToken = mongoose.model('BotToken', botTokenSchema);

// MongoDB Schema for User (owner of the bot)
const userSchema = new mongoose.Schema({
  name: String,  // Owner's name
  userId: { type: Number, unique: true },  // Telegram user ID (to link with the bot)
});

const UserModel = mongoose.model('User', userSchema);

// MongoDB Schema for CloneUser (to store users who start the cloned bot)
const cloneUserSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },  // Telegram user ID
  chatId: Number,  // Chat ID for the user
  botToken: String,  // The token of the cloned bot
  dateJoined: { type: Date, default: Date.now },  // Date when the user started the bot
});

const CloneUser = mongoose.model('CloneUser', cloneUserSchema);



// List of unique emojis for reactions
const myEmoji = ["👍", "❤", "🔥", "🥰", "👏", "😁", "🤔", "🤯", "😱", "🎉", "🤩", , "🙏", "👌",  "😍", "❤‍🔥", "🌚", "💯", "🤣", "💔", "🇮🇳", "😈", "😭", "🤓",  "😇", "🤝", "🤗", "🫡", "🤪", "🗿", "🆒", "💘", "😘", "😎"];

// Function to escape special characters for MarkdownV2
function escapeMarkdownV2(text) {
  return text.replace(/([_*\[\]()~`>#+-=|{}.!])/g, '\\$1');
}

// Command: /start for main bot
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Welcome message with bot description and useful commands
  const text = `𝐇𝐞𝐲, 𝐈 𝐚𝐦 𝐚 𝐚𝐮𝐭𝐨 𝐫𝐞𝐚𝐜𝐭𝐢𝐨𝐧 𝐛𝐨𝐭!\n\nAᴅᴅ ᴍᴇ ᴛᴏ ʏᴏᴜʀ ɢʀᴏᴜᴘ/ᴄʜᴀɴɴᴇʟ ᴛᴏ ɢᴇᴛ ᴇᴍᴏᴊɪ ʀᴇᴀᴄᴛɪᴏɴs!\nTᴏ jᴏɪɴ, clɪcᴋ ᴛʜᴇ ʙᴜᴛᴛᴏɴ ʙᴇʟᴏᴡ:\n\n` +
    `𝐔𝐒𝐄𝐅𝐔𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒:\n` +
    `/start - Sᴛᴀʀᴛ ʏᴏᴜʀ ʙᴏᴛ ᴀɴᴅ ɢᴇᴛ ʜᴇʟᴘ ɪɴғᴏ\n` +
    `/mybot - Lɪsᴛ ᴏғ ʏᴏᴜʀ ᴄʟᴏɴᴇᴅ ʙᴏᴛ\n` +
    `/clone {bot_token} - Clᴏɴᴇ ᴀ boᴛ ᴡɪᴛʜ ᴛʜᴇ ᴛᴏᴋᴇɴ @BotFather\n\n` +
    `𝐎𝐖𝐍𝐄𝐑 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒:\n` +
    `/cloned - Lɪsᴛ ᴏғ ᴀʟʟ cloɴᴇᴅ ʙᴏᴛ ɪɴ ᴛʜᴇ sʏsᴛᴇᴍ\n` +
    `/del {username} - Dᴇʟᴇᴛᴇ ᴀ ᴄʟᴏɴᴇᴅ ʙᴏᴛ ɪɴ ᴛʜᴇ sʏsᴛᴇᴍ\n\n` +
    `𝐍ᴏᴛᴇ: Tʜɪs ʙᴏᴛ ɪs ᴄᴏsᴛ-ғʀᴇᴇ ᴛᴏ ᴜsᴇ!\n\n` +
    `Tᴏ jᴏɪɴ, clɪᴄᴋ ᴛʜᴇ ʙᴜᴛᴛᴏɴ ʙᴇʟᴏᴡ:`;

  const escapedText = escapeMarkdownV2(text);

  bot.sendMessage(chatId, escapedText, {
    parse_mode: 'MarkdownV2',
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Jᴏɪɴ 👋',
          url: 'https://t.me/THE_INCRICIBLE' // Replace with your channel link
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
      console.log(`Main bot reacted with ${doEmoji} to message: ${msg.text}`);
    })
    .catch(error => {
      console.error(`Error reacting with emoji: ${error}`);
    });
  }
});

bot.onText(/\/broadcast (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const messageText = match[1]?.trim(); // Message to broadcast

  // Check if the sender is the bot owner
  if (msg.from.id !== ownerId) {
    return bot.sendMessage(chatId, '⤿ Bʜᴀɢ ʙᴇᴛɪᴄʜᴏᴅ.');
  }

  if (!messageText) {
    return bot.sendMessage(chatId, '⥃ Pʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ/ʀᴇᴘʟʏ ᴀ ᴍᴇssᴀɢᴇ ᴀғᴛᴇʀ /broadcast.');
  }

  // Send the "Starting broadcast..." message to owner
  const startingMessage = await bot.sendMessage(chatId, '➥ G-ᴄᴀsᴛ ʀᴜɴɪɴɢ...');

  // Call the function to send the message to all users
  await broadcastMessageToUsers(messageText, startingMessage);
});

// Command to send broadcast reply message
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  // Only process if the message is from the owner
  if (msg.from.id !== ownerId) return;

  // Check if the message is a reply
  if (msg.reply_to_message) {
    const replyMessage = msg.reply_to_message.text; // Get the reply text

    if (!replyMessage) return;

    // Send the "Starting broadcast..." message to owner
    const startingMessage = await bot.sendMessage(chatId, '➥ G-ᴄᴀsᴛ ʀᴜɴɪɴɢ...');

    // Call the function to send the reply message to all users
    await broadcastMessageToUsers(replyMessage, startingMessage);
  }
});

// Function to broadcast message to all users
async function broadcastMessageToUsers(messageText, startingMessage) {
  try {
    // Fetch all CloneUser records from MongoDB
    const cloneUsers = await CloneUser.find();
    let sentCount = 0;

    // Fetch all BotTokens (for all cloned bots)
    const botTokens = await BotToken.find();

    // Loop through each BotToken (each cloned bot)
    for (const botTokenDoc of botTokens) {
      const clonedBot = new TelegramBot(botTokenDoc.token, { polling: false }); // Using API call instead of polling

      // Loop through all clone users
      for (const cloneUser of cloneUsers) {
        const chatId = cloneUser.chatId;

        try {
          // Send message to the user using the current cloned bot
          await clonedBot.sendMessage(chatId, messageText);
          sentCount++;
          console.log(`Message sent to userId: ${cloneUser.userId} (chatId: ${chatId}) using bot: ${botTokenDoc.token}`);
        } catch (error) {
          console.error(`Failed to send message to userId: ${cloneUser.userId} using bot: ${botTokenDoc.token}:`, error.message);
        }
      }
    }

    // Edit the "Starting broadcast..." message to show the stats
    await bot.editMessageText(`⎋ Bʀᴏᴀᴅᴄᴀsᴛ ᴄᴏᴍᴘʟᴇᴛᴇ! Mᴇssᴀɢᴇ sᴇɴᴛ ᴛᴏ ${sentCount} ᴜsᴇʀs.`, {
      chat_id: startingMessage.chat.id,
      message_id: startingMessage.message_id
    });

    console.log(`Broadcast complete! Message sent to ${sentCount} users.`);
    
  } catch (error) {
    console.error('Error broadcasting message:', error.message);
  }
}



// Function to start cloned bots
async function startClonedBots() {
  try {
    // Fetch unique bot tokens from MongoDB
    const storedBots = await BotToken.aggregate([
      { 
        $group: { 
          _id: "$token", 
          botName: { $first: "$botName" }, 
          ownerId: { $first: "$ownerId" },
          ownerName: { $first: "$ownerName" }  // Also fetch ownerName
        } 
      }
    ]);

    // Iterate through each botData
    for (const botData of storedBots) {
      const clonedBot = new TelegramBot(botData._id, { polling: true });

      // Command: /start for the cloned bot
      clonedBot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        try {
          const { ownerId, ownerName } = botData;  // Already extracted from the aggregation query

          // Save the cloner's ID (the user who started the bot) in the database
          const userBots = await BotToken.find({ userId: msg.from.id }); // Assuming you want to fetch userBots

          // Save clonerId in the BotToken collection
          await BotToken.updateOne(
            { token: botData._id },
            { $set: { clonerId: msg.from.id.toString() } }  // Save the cloner's ID as string
          );

          // Save the user to the CloneUser collection
          const existingUser = await CloneUser.findOne({ userId });
          if (!existingUser) {
            const newCloneUser = new CloneUser({
              userId: userId,
              chatId: chatId,
              botToken: botData._id,  // Save the cloned bot's token
            });
            await newCloneUser.save();
            console.log(`New user added to cloneuser collection: ${userId}`);
          } else {
            console.log(`User ${userId} already exists in the cloneuser collection.`);
          }

          // Escape special characters for MarkdownV2
          const clonedBotText = `Hᴇʏ, ɪ ᴀᴍ ᴀ ʀᴇᴀᴄᴛɪᴏɴ ʙᴏᴛ!

Aᴅᴅ ᴍᴇ ᴛᴏ ʏᴏᴜʀ ɢʀᴏᴜᴘ/ᴄʜᴀɴɴᴇʟ ᴛᴏ ɢᴇᴛ ᴇᴍᴏᴊɪ ʀᴇᴀᴄᴛɪᴏɴs!

Cʟᴏɴᴇᴅ ʙᴏᴛ ᴏғ @Reaction_probot 🙃`;

          await clonedBot.sendMessage(chatId, clonedBotText, {
            parse_mode: 'HTML',  // Using HTML parse mode instead of MarkdownV2
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '˹ ɪɴᴄʀɪᴄɪʙʟᴇ-ᴍᴜsɪᴄ ™˼𓅂',  // Button text
                    url: 'https://t.me/THE_INCRICIBLE'  // URL that the button will open
                  }
                ]
              ]
            }
          });
        } catch (error) {
          console.error("Error sending /start message for cloned bot:", error.message);
        }
      }); // End of onText function

      // Handle regular messages (non-command)
      clonedBot.on('message', (msg) => {
        const clonedChatId = msg.chat.id;
        const clonedMessageId = msg.message_id;

        console.log(`Cloned bot received message: ${msg.text}, chatId: ${clonedChatId}, messageId: ${clonedMessageId}`);

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
          console.error(`Error reacting with emoji in cloned bot: ${error.message}`);
        });
      }); // End of 'message' event listener

      console.log(`Cloned bot "${botData.botName}" is running...`);
    }  // End of forEach loop

  } catch (error) {
    console.error('Error starting cloned bots:', error.message);
  }
}  // End of startClonedBots function
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
    console.log(`Unauthorized access attempt by user ${msg.from.id} to /del command.`);
    return; // Do nothing for unauthorized users
  }

  try {
    // Find the bot in the database using the provided token
    const botToDelete = await BotToken.findOne({ token: token });

    if (!botToDelete) {
      bot.sendMessage(chatId, '❌ Nᴏ ʙᴏᴛ ғᴏᴜɴᴅ ᴡɪᴛʜ ᴛʜɪs ᴛᴏᴋᴇɴ.');
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
    bot.sendMessage(
      chatId,
      `✅ Tʜᴇ ʙᴏᴛ "${botToDelete.botName}" ʜᴀs ʙᴇᴇɴ ᴅᴇʟᴇᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ.`
    );

    console.log(`Deleted and stopped bot "${botToDelete.botName}" with token ${token}`);
  } catch (error) {
    console.error("Error in /del command:", error.message);
    bot.sendMessage(chatId, '❌ Aɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ ᴡʜɪʟᴇ ᴅᴇʟᴇᴛɪɴɢ ᴛʜᴇ ʙᴏᴛ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.');
  }
});


bot.onText(/\/cloned/, async (msg) => {
  const chatId = msg.chat.id;
  console.log("Received /cloned command from user:", msg.from.id);

  // Check if the command is sent by the owner
  if (msg.from.id !== ownerId) {
    console.log("Unauthorized user attempted to use /cloned command:", msg.from.id);
    return; // Do nothing for unauthorized users
  }

  try {
    console.log("Fetching cloned bots from the database...");
    const storedBots = await BotToken.find().catch(err => {
      console.error("Error fetching bots from DB:", err);
      bot.sendMessage(chatId, 'Database error. Please try again later.');
      return [];
    });

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
      const botList = await Promise.all(chunk.map(async (bot, index) => {
        const botName = bot.botName;
        const token = bot.token;

        // Get bot info (name and username) using Telegram's API
        const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`).catch(err => {
          console.error("Error fetching bot info:", err.response ? err.response.data : err.message);
          return null; // If error, return null
        });

        if (response && response.data.ok) {
          const botUsername = response.data.result.username;
          return `<b>${i + index + 1}. Bᴏᴛ Nᴀᴍᴇ:</b> ${botName}\n<b>Usᴇʀɴᴀᴍᴇ:</b> @${botUsername}\n<b>Tᴏᴋᴇɴ:</b> <code>${token}</code>`;
        } else {
          return `<b>${i + index + 1}. Bᴏᴛ Nᴀᴍᴇ:</b> ${botName}\n<b>Tᴏᴋᴇɴ:</b> <code>${token}</code> (Unable to fetch username)`;
        }
      }));

      const message = `<b>Lɪsᴛ ᴏғ Clᴏɴᴇᴅ Bᴏᴛs:</b>\n\n${botList.join('\n\n')}`;
      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
        .catch(error => {
          console.error("Error sending /cloned response:", error.message);
          bot.sendMessage(chatId, 'Failed to send cloned bot list. Please try again later.');
        });
    }
  } catch (error) {
    console.error("Error fetching cloned bots from database:", error.message);
    bot.sendMessage(chatId, 'An error occurred while fetching the cloned bots. Please try again later.');
  }
});

// Command: /clone <bot_token>
bot.onText(/\/clone(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const token = match[1]?.trim(); // Extract the token, if provided
  const userId = msg.from.id; // Get the user ID from the message

  // Check if the user provided a token
  if (!token) {
    bot.sendMessage(
      chatId,
      '❌ Usᴇs ᴡʀᴏɴɢ:\n/clone {bot_token}\n\nPʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ʙᴏᴛ ᴛᴏᴋᴇɴ ᴛᴏ clᴏɴᴇ.'
    );
    return;
  }

  try {
    const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
    if (response.data.ok) {
      const botInfo = response.data.result;

      bot.sendMessage(
        chatId,
        `✅ Tᴏᴋᴇɴ ғᴇᴛᴄʜᴇᴅ! Bᴏᴛ "${botInfo.first_name}" (@${botInfo.username}) ɪs sᴛᴀʀᴛɪɴɢ...`
      );

      // Save the new bot to the database, associating it with the user's ID
      const newBotToken = new BotToken({
        botName: botInfo.first_name,
        username: botInfo.username, // Save the username as well
        token: token,
        userId: userId // Associate the bot with the user
      });
      await newBotToken.save();

      console.log(
        `Stored bot token for "${botInfo.first_name}" (@${botInfo.username}) in MongoDB, associated with user ${userId}`
      );
      startClonedBots();
    } else {
      bot.sendMessage(chatId, '❌ Iɴᴠᴀʟɪᴅ ᴛᴏᴋᴇɴ. Pʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.');
    }
  } catch (error) {
    console.error("Error in /clone command:", error.message);
  }
});



bot.onText(/\/mybot/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    // Fetch cloned bots for the current user
    const userBots = await BotToken.find({ userId: msg.from.id });

    if (userBots.length === 0) {
      bot.sendMessage(chatId, '❌ Yᴏᴜ ᴅᴏ ɴᴏᴛ ʜᴀᴠᴇ ᴀɴʏ clᴏɴᴇᴅ ʙᴏᴛs.');
      return;
    }

    console.log(`Found ${userBots.length} cloned bots for user: ${msg.from.id}`);

    // Prepare the list of bots to send to the user with bot's name and username
    const botList = await Promise.all(userBots.map(async (bot, index) => {
      const botName = bot.botName;
      const token = bot.token;

      // Get bot info (name and username) using Telegram's API
      const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
      const botUsername = response.data.result.username;  // This is the bot's Telegram username

      return `<b>${index + 1}. Bᴏᴛ Nᴀᴍᴇ:</b> ${botName}\n<b>Usᴇʀɴᴀᴍᴇ:</b> @${botUsername}\n<b>Cᴏsᴛ:</b> Fʀᴇᴇ 🤑`; // Adding Cost info
    }));

    const message = `<b>Yᴏᴜʀ Clᴏɴᴇᴅ Bᴏᴛs:</b>\n\n${botList.join('\n\n')}`;
    bot.sendMessage(chatId, message, { parse_mode: 'HTML' });

  } catch (error) {
    console.error("Error fetching user cloned bots:", error.message);
    bot.sendMessage(chatId, '❌ An error occurred while fetching your cloned bots. Please try again later.');
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


const app = express();

// Define a route to handle incoming requests
app.get('/', (req, res) => {
  res.send('Auto Reaction Bot is running!');
});

// Start Express server on port 8000
app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
