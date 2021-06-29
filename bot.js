/* ENV VARIABLES
*  TOKEN: Bot token
*  NASA_API_KEY: NASA API Key
*/

const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS"] });

const axios = require('axios');

const urls = require('./config/urls.json');
const slashCommands = require('./config/slashcommands.json')

client.once('ready', () => {
  // Register slash commands globally
  client.application.commands.set(slashCommands);

  // Log bot tag to console on start
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interaction", interaction => {
  // If the interaction isn't a slash command, return
  if (!interaction.isCommand()) return;

  switch(interaction.commandName) {
    case "apod":
      apod(interaction);
      break;
  } // End interaction command name switch
});

async function apod(interaction) {
  const nasaApiKey = process.env.NASA_API_KEY;
  axios.get(`${urls.apod}${nasaApiKey}`)
    .then(response => {
      const apodEmbed = new Discord.MessageEmbed()
        .setAuthor(interaction.user.tag, interaction.author.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setTitle(response.title)
        .setDescription(response.explanation)
        .setField('Copyright', `©️ ${response.copyright}`, true)
        .setField('Link', `[Click here!](response.hdurl)`, true)
        .setImage(response.hdurl)
        .setFooter(`Bot ID: ${client.user.id}`)
        .setColor('ffffff')
        .setTimestamp();

      interaction.reply(apodEmbed);
    })
    .catch(console.error);
}

client.login(process.env.TOKEN);
