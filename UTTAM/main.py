import random
from telegram import Update
from telegram.ext import Updater, MessageHandler, Filters, CommandHandler
from telegram.ext import CallbackContext

# Bot Token
TOKEN = '7638229482:AAHzcKi2S6Z_Z472lxOUXJv2YOmdOezrnX0'

# List of emojis for random selection
emoji_list = ['👍', '❤️', '😂', '😲', '🎉', '🔥', '👏', '😎']

# Function to handle messages and react with a random emoji
def react_to_post(update: Update, context: CallbackContext):
    message = update.message
    if message.text:  # Only react to text messages
        bot = context.bot

        # Choose a random emoji from the list
        random_emoji = random.choice(emoji_list)

        # Add the reaction to the message
        bot.react_to_message(chat_id=message.chat_id, message_id=message.message_id, emoji=random_emoji)

# Start command to greet the user when bot is added
def start(update: Update, context: CallbackContext):
    update.message.reply_text('Hello! I will react to messages with random emojis.')

def main():
    # Create the Updater and pass it your bot's token
    updater = Updater(TOKEN, use_context=True)

    # Get the dispatcher to register handlers
    dispatcher = updater.dispatcher
    
    # Add a command handler to handle the /start command
    dispatcher.add_handler(CommandHandler('start', start))

    # Add a message handler to react to messages in the group/channel
    dispatcher.add_handler(MessageHandler(Filters.text & (~Filters.command), react_to_post))

    # Start polling for updates
    updater.start_polling()

    # Block until you send a signal to stop the bot
    updater.idle()

if __name__ == '__main__':
    main()
