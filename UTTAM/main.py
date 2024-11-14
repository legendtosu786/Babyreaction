import random
from telegram import Update
from telegram.ext import Application, MessageHandler, CommandHandler, CallbackContext
from telegram.ext import filters

# Bot Token
TOKEN = '7638229482:AAHzcKi2S6Z_Z472lxOUXJv2YOmdOezrnX0'

# List of emojis for random selection
emoji_list = ['👍', '❤️', '😂', '😲', '🎉', '🔥', '👏', '😎']

# Function to handle messages and react with a random emoji
async def react_to_post(update: Update, context: CallbackContext):
    message = update.message
    if message.text:  # Only react to text messages
        bot = context.bot

        # Choose a random emoji from the list
        random_emoji = random.choice(emoji_list)

        # Add the reaction to the message
        await bot.add_reaction(chat_id=message.chat_id, message_id=message.message_id, emoji=random_emoji)

# Start command to greet the user when bot is added
async def start(update: Update, context: CallbackContext):
    await update.message.reply_text('Hello! I will react to messages with random emojis.')

def main():
    # Create the Application and pass it your bot's token
    application = Application.builder().token(TOKEN).build()

    # Add a command handler to handle the /start command
    application.add_handler(CommandHandler('start', start))

    # Add a message handler to react to messages in the group/channel
    application.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), react_to_post))

    # Start polling for updates
    application.run_polling()

if __name__ == '__main__':
    main()