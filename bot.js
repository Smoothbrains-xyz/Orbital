/* ENV VARIABLES
*  TOKEN: Bot token
*  NASA_API_KEY: NASA API Key
*/

const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS"] });

const axios = require('axios');

const urls = require('./config/urls.json');
const slashCommands = require('./config/slashcommands.json')

const nasaApiKey = process.env.NASA_API_KEY;
const token = process.env.TOKEN;

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
<<<<<<< HEAD
    case "help":
      help(interaction);
      break;
    case "ping":
      ping(interaction);
=======
    case "epic":
      epic(interaction.options.first().name /* Subcommand name */, interaction);
>>>>>>> 871c5702e4436e8041bc1b0e543b639fb4f57d49
      break;
  } // End interaction command name switch
});

async function apod(interaction) {
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

      interaction.reply({ embeds: [apodEmbed]});
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
        .setImage(`https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s+000(${data.iss_position.longitude},${data.iss_position.latitude})/-87.0186,20,1/1000x1000?access_token=pk.eyJ1IjoiYWRhd2Vzb21lZ3V5IiwiYSI6ImNrbGpuaWdrYzJ0bGYydXBja2xsNmd2YTcifQ.Ude0UFOf9lFcQ-3BANWY5A`)
        .setFooter(`Bot ID: ${client.user.id}`)
        .setColor("ffffff")
        .setTimestamp();
      axios.get(`${urls.iss_astros}`)
        .then(response => {
          astroData = response.data;
          issEmbed.addField(`Astronauts`, `${astroData.people.map(e => e.name).join(" • ")}`);
          issEmbed.addField("Coordinates", `(${data.iss_position.latitude}, ${data.iss_position.longitude})`, true)
          issEmbed.addField("Link", `[Click here!](https://spotthestation.nasa.gov/tracking_map.cfm)`, true)
          interaction.reply({ embeds: [issEmbed] });
        });
    })
    .catch(console.error);
}

<<<<<<< HEAD
async function help(interaction) {
      const helpEmbed = new Discord.MessageEmbed()
        .setTitle("Help Command • Orbital")
        .setDescription("TODO")
        .addField("Command List:", "TODO")
        .setColor("ffffff")
        .setFooter(`• Orbital`)
        .setTimestamp();
}

async function ping(interaction) {
  const pingEmbed = new Discord.MessageEmbed()
    .setTitle("Current Ping • Orbital")
    .setDescription(`:ping_pong: Pong: ${client.ws.ping}ms!`)
    .setColor("ffffff")
    .setFooter(`• Orbital`)
    .setTimestamp();
}

client.login(process.env.TOKEN);
=======
async function epic (action, interaction) {
  if (action === "natural") {
    axios.get(`${urls.epic_natural_date}${nasaApiKey}`)
      .then(response => {
        data = response.data;
        randomDate = data[Math.floor(Math.random() * data.length)].date;
        axios.get(`${urls.epic_natural_image}${randomDate}?api_key=${nasaApiKey}`)
          .then(response => {
            data = response.data;
            randomImage = data[Math.floor(Math.random() * data.length)];
            randomImageURL = `${urls.epic_natural_archive}${randomDate.replace(/-/g, '/')}/png/${randomImage.image}.png?api_key=${nasaApiKey}`;
            const epicNaturalEmbed = new Discord.MessageEmbed()
              .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
              .setTitle("NASA Earth Polychromatic Imaging Camera (EPIC)")
              .setDescription(randomImage.caption)
              .addField("DSCOVR Position", `\`X\`: ${Math.trunc(randomImage.dscovr_j2000_position.x)}\n\`Y\`: ${Math.trunc(randomImage.dscovr_j2000_position.y)}\n\`Z\`: ${Math.trunc(randomImage.dscovr_j2000_position.z)}`, true)
              .addField("Solar Position", `\`X\`:${Math.trunc(randomImage.sun_j2000_position.x)}\n\`Y\`: ${Math.trunc(randomImage.sun_j2000_position.y)}\n\`Z\`: ${Math.trunc(randomImage.sun_j2000_position.z)}`, true)
              .addField("Lunar Position", `\`X\`:${Math.trunc(randomImage.lunar_j2000_position.x)}\n\`Y\`: ${Math.trunc(randomImage.lunar_j2000_position.y)}\n\`Z\`: ${Math.trunc(randomImage.lunar_j2000_position.z)}`, true)
              .setImage(randomImageURL)
              .setFooter(`Bot ID: ${client.user.id}`)
              .setColor('ffffff')
              .setTimestamp();
            interaction.reply({ embeds: [epicNaturalEmbed] });
          });
      });
  } else if (action === "enhanced") {
    axios.get(`${urls.epic_enhanced_date}${nasaApiKey}`)
      .then(response => {
        data = response.data;
        randomDate = data[Math.floor(Math.random() * data.length)].date;
        axios.get(`${urls.epic_enhanced_image}${randomDate}?api_key=${nasaApiKey}`)
          .then(response => {
            data = response.data;
            randomImage = data[Math.floor(Math.random() * data.length)];
            randomImageURL = `${urls.epic_enhanced_archive}${randomDate.replace(/-/g, '/')}/png/${randomImage.image}.png?api_key=${nasaApiKey}`;
            const epicEnhancedEmbed = new Discord.MessageEmbed()
              .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
              .setTitle("NASA Earth Polychromatic Imaging Camera (EPIC)")
              .setDescription(randomImage.caption)
              .addField("DSCOVR Position", `\`X\`: ${Math.trunc(randomImage.dscovr_j2000_position.x)}\n\`Y\`: ${Math.trunc(randomImage.dscovr_j2000_position.y)}\n\`Z\`: ${Math.trunc(randomImage.dscovr_j2000_position.z)}`, true)
              .addField("Solar Position", `\`X\`:${Math.trunc(randomImage.sun_j2000_position.x)}\n\`Y\`: ${Math.trunc(randomImage.sun_j2000_position.y)}\n\`Z\`: ${Math.trunc(randomImage.sun_j2000_position.z)}`, true)
              .addField("Lunar Position", `\`X\`:${Math.trunc(randomImage.lunar_j2000_position.x)}\n\`Y\`: ${Math.trunc(randomImage.lunar_j2000_position.y)}\n\`Z\`: ${Math.trunc(randomImage.lunar_j2000_position.z)}`, true)
              .setImage(randomImageURL)
              .setFooter(`Bot ID: ${client.user.id}`)
              .setColor('ffffff')
              .setTimestamp();
            interaction.reply({ embeds: [epicEnhancedEmbed] });
          });
      });
  }
}

client.login(token);
>>>>>>> 871c5702e4436e8041bc1b0e543b639fb4f57d49
