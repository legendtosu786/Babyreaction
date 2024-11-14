# Telegram Reaction Bot

This is a simple Telegram bot that reacts to messages with random emojis. It is built using Node.js, and you can deploy it using Docker.

## Setup Instructions

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Start the bot using `npm start`.
4. You can also deploy it using Docker.

## Docker Deployment

To build and run the bot in Docker:

```bash
docker build -t telegram-bot .
docker run -p 8000:8000 telegram-bot
