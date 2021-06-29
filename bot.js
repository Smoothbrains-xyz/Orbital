const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS"] });

const axios = require('axios');

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});



client.login(process.env.TOKEN);
