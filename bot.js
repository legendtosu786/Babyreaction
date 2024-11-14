const TelegramBot = require('node-telegram-bot-api');

// Your bot's token (replace it with your actual token)
const token = '7638229482:AAHzcKi2S6Z_Z472lxOUXJv2YOmdOezrnX0';

// Create a new bot instance
const bot = new TelegramBot(token, { polling: true });

// List of emojis to react with
const emojis = ['👍', '😄', '❤️', '😂', '🎉', '🙌', '😎', '🔥', '💯', '👀'];

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Send a welcome message when the user starts the bot
  bot.sendMessage(chatId, 'Hello! I am your Emoji Bot. Send me a message and I will reply with a random emoji!');
});

// Listen for any new messages (including private messages, groups, and channels)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  // Select a random emoji from the list
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  // Send the random emoji as a reply (for any message type)
  bot.sendMessage(chatId, randomEmoji, { reply_to_message_id: messageId })
    .then(() => {
      console.log(`Replied with ${randomEmoji} to message: ${msg.text}`);
    })
    .catch((error) => {
      console.error(`Error sending emoji: ${error}`);
    });
});
