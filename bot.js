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
  bot.sendMessage(chatId, 'Hello! I am your Emoji Bot. Send me a message and I will react with a random emoji!');
});

// Listen for new messages and react with a random emoji
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  // Ensure we only react to group or private messages (ignoring any non-message events)
  if (msg.chat.type === 'private' || msg.chat.type === 'group' || msg.chat.type === 'supergroup' || msg.chat.type === 'channel') {
    // Select a random emoji from the list
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    // React to the message with a random emoji (using the "addReaction" method)
    bot.reactToMessage(chatId, messageId, randomEmoji)
      .then(() => {
        console.log(`Reacted with ${randomEmoji} to message: ${msg.text}`);
      })
      .catch((error) => {
        console.error(`Error reacting with emoji: ${error}`);
      });
  }
});
