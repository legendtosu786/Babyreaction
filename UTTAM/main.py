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
    try:
        message = update.message
        # Agar message text mein hai to react karein
        if message.text:
            emoji = "👍"  # Yahan par koi emoji dal sakte hain jo aap chahte hain
            await message.react(emoji)
    except Exception as e:
        logger.error(f"Error in react_to_message: {e}")

# Start function jo bot ko chalu karega
async def start(update: Update, context: CallbackContext):
    try:
        await update.message.reply_text("Bot is now active! It will react to messages.")
    except Exception as e:
        logger.error(f"Error in start function: {e}")

# Main function to setup the bot
async def main():
    try:
        # Create the application
        application = Application.builder().token(TOKEN).build()

        # Initialize the application (await it to avoid warnings)
        await application.initialize()

        # Command to start the bot
        application.add_handler(CommandHandler("start", start))

        # Message handler to react on every message
        application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, react_to_message))

        # Start the bot (this will manage the event loop internally)
        await application.run_polling()

    except Exception as e:
        logger.error(f"Error in main function: {e}")

# Custom event loop to handle shutdown gracefully
def run():
    try:
        # Get the current event loop or create one
        loop = asyncio.get_event_loop()

        # Run the bot's main async function using the event loop
        loop.create_task(main())

        # Let the event loop run indefinitely
        loop.run_forever()

    except Exception as e:
        logger.error(f"Error in running the bot: {e}")
    finally:
        # Ensure shutdown
        loop.close()

if __name__ == '__main__':
    run()
