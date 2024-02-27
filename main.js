const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Constants
const MY_GUILD_ID = process.env.GUILD_ID;

// Event: Bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag} (ID: ${client.user.id})`);
});

// Event: Message received
client.on('messageCreate', async (message) => {
  if (message.content.toLowerCase() === '!start-adventure') {
    // Check if the user already has roles
    const existingRoles = message.member.roles.cache.filter(role => role.name.endsWith('Adventurer') || role.name.endsWith('Class'));
    if (existingRoles.size > 0) {
      const replyMessage = 'You already have roles. You can only get roles once.';
      const options = ['Exit', 'Proceed'];

      // Send a confirmation message with options
      const confirmationMessage = await message.reply({
        content: replyMessage,
        components: [{
          type: 'ACTION_ROW',
          components: options.map(option => ({
            type: 'BUTTON',
            style: 'PRIMARY',
            label: option,
            customId: option.toLowerCase(),
          })),
        }],
      });

      // Await user's choice
      const filter = i => i.customId && options.map(opt => opt.toLowerCase()).includes(i.customId) && i.user.id === message.author.id;
      const collector = confirmationMessage.createMessageComponentCollector({ filter, time: 15000 }); // Adjust time as needed

      collector.on('collect', async (interaction) => {
        // User clicked a button
        await interaction.deferUpdate();

        if (interaction.customId === 'exit') {
          message.channel.send('Adventure canceled. If you change your mind, use `!start-adventure` again.');
        } else if (interaction.customId === 'proceed') {
          createCommand(message);
        }
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          message.channel.send('Adventure canceled due to inactivity. If you change your mind, use `!start-adventure` again.');
        }
      });

    } else {
      // User does not have roles, proceed with creating roles
      createCommand(message);
    }
  }
});

// Command: Create Adventure
async function createCommand(message) {
  const race = ['Dwarf', 'Elf', 'Halfling', 'Human', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling'];
  const classification = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'];
  const background = ['Acolyte', 'Charlatan', 'Entertainer', 'Folk-Hero', 'Guild Artisan', 'Hermit', 'Noble', 'Outlander', 'Sage', 'Sailor', 'Soldier', 'Urchin'];

  // Check if the user already has roles
  const existingRoles = message.member.roles.cache.filter(role => role.name.endsWith('Adventurer') || role.name.endsWith('Class'));
  if (existingRoles.size > 0) {
    message.reply('You already have roles. You can only get roles once.');
    return;
  }

  const randomRace = race[Math.floor(Math.random() * race.length)];
  const randomClass = classification[Math.floor(Math.random() * classification.length)];
  const randomBackground = background[Math.floor(Math.random() * background.length)];

  // Create role names
  const roleRace = `${randomRace} Adventurer`;
  const roleClass = `${randomClass} Class`;

  try {
    // Create roles
    const createdRoleRace = await message.guild.roles.create({
      name: roleRace,
      color: 0x00FF00, // Green color
    });

    const createdRoleClass = await message.guild.roles.create({
      name: roleClass,
      color: 0x0000FF, // Blue color
    });

    // Add roles to the user
    await message.member.roles.add([createdRoleRace.id, createdRoleClass.id]);

    const embed = {
      title: 'Random D&D Character Generator',
      description: `Race: ${randomRace}\nClass: ${randomClass}\nBackground: ${randomBackground}`,
      color: 0x00ff00,
    };

    message.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(`Error during createCommand: ${error}`);
    message.channel.send('Error creating roles. Please check permissions.');
  }
}

// Log in to Discord
const TOKEN = process.env.DISCORD_TOKEN;
if (TOKEN) {
  client.login(TOKEN);
} else {
  console.error('Discord token not found. Check your .env file.');
}
