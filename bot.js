/* ENV VARIABLES
*  TOKEN: Bot token
*  NASA_API_KEY: NASA API Key
*/
require('dotenv').config()

const Discord = require('discord.js');
const client = new Discord.Client({
  intents: ["GUILD_PRESENCES",  "GUILD_MEMBERS", "GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS"],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

const axios = require('axios');

const urls = require('./config/urls.json');
const slashCommands = require('./config/slashcommands.json')
let embedInfo;

const nasaApiKey = process.env.NASA_API_KEY;
const token = process.env.TOKEN;

client.once('ready', () => {
  // Register slash commands globally
  client.application.commands.set(slashCommands);

  // Log bot tag to console on start
  console.log(`Logged in as ${client.user.tag}!`);

  // Set embed info
  embedInfo = {
    color: "ffffff",
    footer: [
      `${client.user.tag}`,
      `${client.user.displayAvatarURL({ dynamic: true, size: 1024 })}`
    ]
  }

  // Set presence
  client.user.setPresence({ activities: [
    {
      name: "the night sky • /help",
      type: "WATCHING",
      url: "https://github.com/ADawesomeguy/nasa-bot"
    }
  ]});
});

client.on("interaction", interaction => {
  // If the interaction isn't a slash command, return
  if (!interaction.isCommand()) return;

  // Switch between categories and uncategorized commands
  switch(interaction.commandName) {
    case "news":
      news(interaction);
      break;
    case "ping":
      ping(interaction);
      break;
  } // End interaction command name switch
});

async function news(interaction) {
  const row = new Discord.MessageActionRow()
			.addComponents(
				new Discord.MessageSelectMenu()
					.setCustomID('select')
					.setPlaceholder('Nothing selected')
					.addOptions([
						{
							label: 'Finance',
							description: 'View US Finance News',
							value: 'first_option',
						},
						{
							label: 'Sports',
							description: 'View US Sports News',
							value: 'second_option',
						},
					]),
			);

		await interaction.reply({ content: 'News Options:', components: [row] });
}

async function ping(interaction) {
  const pingEmbed = new Discord.MessageEmbed()
    .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .setTitle("Pong!")
    .setDescription(`🏓 ${Date.now() - interaction.createdTimestamp}ms`)
    .addField(`API`, `${Math.round(client.ws.ping)}ms`)
    .setColor(`${embedInfo.color}`)
    .setFooter(embedInfo.footer[0], embedInfo.footer[1])
    .setTimestamp();

  interaction.reply({ embeds: [pingEmbed] });
}

client.login(token);