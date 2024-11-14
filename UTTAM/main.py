from telegram import Update
from telegram import Updater, CommandHandler, MessageHandler, Filters, CallbackContext

# Bot's Token from BotFather
TOKEN = '7638229482:AAHzcKi2S6Z_Z472lxOUXJv2YOmdOezrnX0'

# Emoji react karne ke liye function
def react_to_message(update: Update, context: CallbackContext):
    message = update.message

    # Agar message text mein hai to react karein
    if message.text:
        emoji = "👍"  # Yahan par koi emoji dal sakte hain jo aap chahte hain
        message.react(emoji)

# Start function jo bot ko chalu karega
def start(update: Update, context: CallbackContext):
    update.message.reply_text("Bot is now active! It will react to messages.")

# Main function to setup the bot
def main():
    updater = Updater(TOKEN)

    # Get the dispatcher to register handlers
    dp = updater.dispatcher

    # Command to start the bot
    dp.add_handler(CommandHandler("start", start))

    # Message handler to react on every message
    dp.add_handler(MessageHandler(Filters.text & ~Filters.command, react_to_message))

    # Start the bot
    updater.start_polling()

    # Run the bot until you send a stop command
    updater.idle()

if __name__ == '__main__':
    main()
