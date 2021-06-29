const Discord = require('discord.js');
const client = new Discord.Client();

const axios = require('axios');

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.TOKEN);
