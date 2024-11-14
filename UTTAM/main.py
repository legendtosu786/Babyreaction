from telegram import Update
from telegram.ext import CommandHandler, MessageHandler, Application, CallbackContext
from telegram.ext.filters import Filters

# Bot's Token from BotFather
TOKEN = '7638229482:AAHzcKi2S6Z_Z472lxOUXJv2YOmdOezrnX0'

# Emoji react karne ke liye function
async def react_to_message(update: Update, context: CallbackContext):
    message = update.message

    # Agar message text mein hai to react karein
    if message.text:
        emoji = "👍"  # Yahan par koi emoji dal sakte hain jo aap chahte hain
        await message.react(emoji)

# Start function jo bot ko chalu karega
async def start(update: Update, context: CallbackContext):
    await update.message.reply_text("Bot is now active! It will react to messages.")

# Main function to setup the bot
async def main():
    application = Application.builder().token(TOKEN).build()

    # Command to start the bot
    application.add_handler(CommandHandler("start", start))

    # Message handler to react on every message
    application.add_handler(MessageHandler(Filters.text & ~Filters.command, react_to_message))

    # Start the bot
    await application.run_polling()

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
