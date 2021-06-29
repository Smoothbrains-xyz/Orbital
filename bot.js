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
    case "iss":
      iss(interaction);
      break;
    case "epic":
      epic(interaction.options[0].name /* Subcommand name */, interaction);
      break;
  } // End interaction command name switch
});

async function apod(interaction) {
  const nasaApiKey = process.env.NASA_API_KEY;
  axios.get(`${urls.apod}${nasaApiKey}`)
    .then(response => {
      data = response.data;
      const apodEmbed = new Discord.MessageEmbed()
        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setTitle(data.title)
        .setDescription(data.explanation)
        .addField('Copyright', data.copyright ? `©️ ${data.copyright}` : `None`, true)
        .addField('Link', `[Click here!](${data.hdurl})`, true)
        .setImage(data.hdurl)
        .setFooter(`Bot ID: ${client.user.id}`)
        .setColor('ffffff')
        .setTimestamp();

      interaction.reply({ embeds: [apodEmbed]})
        .then(console.log)
	      .catch(console.error);
    })
    .catch(console.error);
}

async function iss(interaction) {
  axios.get(`${urls.iss_location}`)
    .then(response => {
      data = response.data;
      const issEmbed = new Discord.MessageEmbed()
        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setTitle("International Space Station")
        .addField("Coordinates", `(${data.iss_position.latitude}, ${data.iss_position.longitude})`, true)
        .addField("Link", `[Click here!](https://spotthestation.nasa.gov/tracking_map.cfm)`, true)
        .setImage(`https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s+000(${data.iss_position.longitude},${data.iss_position.latitude})/-87.0186,20,1/1000x1000?access_token=pk.eyJ1IjoiYWRhd2Vzb21lZ3V5IiwiYSI6ImNrbGpuaWdrYzJ0bGYydXBja2xsNmd2YTcifQ.Ude0UFOf9lFcQ-3BANWY5A`)
        .setColor("ffffff")
        .setFooter(`Bot ID: ${client.user.id}`)
        .setTimestamp();
      axios.get(`${urls.iss_astros}`)
        .then(response => {
          data = response.data;
          issEmbed.addField(`Astronauts`, `${data.people.map(e => e.name).join(" • ")}`);
          interaction.reply({ embeds: [issEmbed] });
        });
    })
    .catch(console.error);
}

async function epic (action, interaction) {
  if (action === "natural") {
    console.log(interaction);
  } else if (action === "enhanced") {
    console.log(interaction);
  }
}

client.login(process.env.TOKEN);
