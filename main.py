import discord
from discord import app_commands
from dotenv import load_dotenv
import os
import logging
import random
import signal
import sys

# Load environment variables from .env file
load_dotenv()

# Constants
MY_GUILD_ID = discord.Object(id=int(os.getenv('GUILD_ID')))

# Configure logging
logging.basicConfig(level=logging.INFO)

class MyBot(discord.Client):
    def __init__(self, *, intents: discord.Intents):
        super().__init__(intents=intents)
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self):
        try:
            self.tree.copy_global_to(guild=MY_GUILD_ID)
            await self.tree.sync(guild=MY_GUILD_ID)
            logging.info("CommandTree setup completed successfully.")
        except (discord.errors.HTTPException, discord.errors.Forbidden) as e:
            logging.error(f"Error during setup: {e}", exc_info=True)

intents = discord.Intents.default()
client = MyBot(intents=intents)

@client.event
async def on_ready():
    logging.info(f'Logged in as {client.user} (ID: {client.user.id})')
    logging.info('------')

@client.tree.command(name='start-adventure', description='Random D&D Character Generator')
async def create_command(interaction):
    race = ['Dwarf', 'Elf', 'Halfling', 'Human', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling']
    classification = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard']
    background = ['Acolyte', 'Charlatan', 'Entertainer', 'Folk-Hero', 'Guild Artisan', 'Hermit', 'Noble', 'Outlander', 'Sage', 'Sailor', 'Soldier', 'Urchin']

    combinations = [f"Race: {choice1}\n Class: {choice2}\n Background: {choice3}" for choice1 in race for choice2 in classification for choice3 in background]

    try:
        random_choice = random.choice(combinations)
        embed = discord.Embed(title='Random D&D Character Generator', description=random_choice, color=0x00ff00)
        await interaction.response.send_message(embed=embed)
    except (discord.errors.HTTPException, discord.errors.Forbidden) as e:
        logging.error(f"Error during create_command: {e}", exc_info=True)

# Graceful Shutdown
def signal_handler(signal, frame):
    logging.info("Shutting down gracefully...")
    client.close()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

# Run the bot
TOKEN = os.getenv('DISCORD_TOKEN')
if TOKEN:
    client.run(TOKEN)
else:
    logging.error("Discord token not found. Check your .env file.")
