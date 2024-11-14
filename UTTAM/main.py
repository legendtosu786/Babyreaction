const TelegramBot = require('node-telegram-bot-api');

// Your bot's token (replace it with your actual token)
const token = 'YOUR_BOT_TOKEN';

// Create a new bot instance
const bot = new TelegramBot(token, { polling: true });

// List of emojis to react with
const emojis = ['👍', '😄', '❤️', '😂', '🎉', '🙌', '😎', '🔥', '💯', '👀'];

// Listen for any new messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  // Check if the message is from a group or a channel
  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup' || msg.chat.type === 'channel') {
    // Select a random emoji from the list
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    // Send the random emoji as a reply
    bot.sendMessage(chatId, randomEmoji, { reply_to_message_id: messageId })
      .then(() => {
        console.log(`Replied with ${randomEmoji} to message: ${msg.text}`);
      })
      .catch((error) => {
        console.error(`Error sending emoji: ${error}`);
      });
  }
});
