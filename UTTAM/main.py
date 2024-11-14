import logging
from telegram import Update
from telegram.ext import CommandHandler, MessageHandler, Application, CallbackContext
from telegram.ext import filters
import asyncio

# Bot's Token from BotFather
TOKEN = '7638229482:AAHzcKi2S6Z_Z472lxOUXJv2YOmdOezrnX0'

# Enable logging to see what's happening with the bot
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    level=logging.INFO)
logger = logging.getLogger(__name__)

# Emoji react karne ke liye function
async def react_to_message(update: Update, context: CallbackContext):
    message = update.message
    if message.text:
        emoji = "👍"  # Example emoji to react with
        await message.react(emoji)

# Start function jo bot ko chalu karega
async def start(update: Update, context: CallbackContext):
    await update.message.reply_text("Bot is now active! It will react to messages.")

# Main function to setup the bot
async def main():
    # Create the application
    application = Application.builder().token(TOKEN).build()

    # Initialize the application (await it to avoid warnings)
    await application.initialize()

    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, react_to_message))

    # Run the bot
    await application.run_polling()

# Use asyncio.run to run the main function
if __name__ == '__main__':
    asyncio.run(main())
