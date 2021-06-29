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
    case "iss"
      iss(interaction);
      break;
    default:
      interaction.reply("This commands is still in progress and will hopefully be available shortly);
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
  axios.get("http://api.open-notify.org/iss-now.json")
    .then(response => {
      data = response;
      const issEmbed = new Discord.MessageEmbed()
        .setTitle("The current location of the ISS!")
        .setURL('https://spotthestation.nasa.gov/tracking_map.cfm')
        .setImage(`https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s+000(${data.iss_position.longitude},${data.iss_position.latitude})/-87.0186,20,1/1000x1000?access_token=pk.eyJ1IjoiYWRhd2Vzb21lZ3V5IiwiYSI6ImNrbGpuaWdrYzJ0bGYydXBja2xsNmd2YTcifQ.Ude0UFOf9lFcQ-3BANWY5A`)
        .setColor("00c5ff")
        .setFooter(`Bot ID: ${client.user.id}`)
        .setTimestamp();
      axios.get("http://api.open-notify.org/astros.json")
        .then(response => {
          data = response;
          issEmbed.addField(`Astronauts`, `${data.people.map(e => e.name).join(" • ")}`);
          interaction.reply({ embeds: issEmbed });
        });
    })
    .catch(error => { if (error) interaction.editReply("Unable to fetch data. Please try again!") });
}

client.login(process.env.TOKEN);
