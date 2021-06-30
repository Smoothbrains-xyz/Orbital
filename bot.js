/* ENV VARIABLES
*  TOKEN: Bot token
*  NASA_API_KEY: NASA API Key
*/

const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS"] });

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
      name: "the night sky",
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
    case "space":
      space(interaction);
      break;
    case "info":
      info(interaction);
      break;
    case "help":
      help(interaction);
      break;
    case "ping":
      ping(interaction);
      break;
  } // End interaction command name switch
});

async function space(interaction) {
  switch(interaction.options.first().name) {
    case "apod":
      apod(interaction);
      break;
    case "iss":
      iss(interaction);
      break;
    case "epic":
      epic(interaction);
      break;
  }
}

async function info(interaction) {
  switch (interaction.options.first().name) {
    case "server":
      serverInfo(interaction);
      break;
    case "bot":
      botInfo(interaction);
      break;
    case "member":
      memberInfo(interaction);
      break;
    case "role":
      roleInfo(interaction);
      break;
  }
}

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
        .setFooter(embedInfo.footer[0], embedInfo.footer[1])
        .setColor(`${embedInfo.color}`)
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
        .setFooter(embedInfo.footer[0], embedInfo.footer[1])
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

async function help(interaction) {
      const helpEmbed = new Discord.MessageEmbed()
        .setTitle("Help Command • Orbital")
        .setDescription("TODO")
        .addField("Command List:", "TODO")
        .setColor("ffffff")
        .setFooter(embedInfo.footer[0], embedInfo.footer[1])
        .setTimestamp();

      interaction.reply({ embeds: [helpEmbed] });
}

async function ping(interaction) {
  const pingEmbed = new Discord.MessageEmbed()
    .setTitle("Current Ping • Orbital")
    .setDescription(`:ping_pong: Pong: ${client.ws.ping}ms!`)
    .setColor("ffffff")
    .setFooter(embedInfo.footer[0], embedInfo.footer[1])
    .setTimestamp();

  interaction.reply({ embeds: [pingEmbed] });
}

async function epic (interaction) {
  // If "enhanced" is false
  if (!interaction.options.first().options.first().value) {
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
              .setFooter(embedInfo.footer[0], embedInfo.footer[1])
              .setColor(`${embedInfo.color}`)
              .setTimestamp();
            interaction.reply({ embeds: [epicNaturalEmbed] });
          });
      });
  // If "enhanced" is true
  } else if (interaction.options.first().options.first().value) {
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
              .setFooter(embedInfo.footer[0], embedInfo.footer[1])
              .setColor(`${embedInfo.color}`)
              .setTimestamp();
            interaction.reply({ embeds: [epicEnhancedEmbed] });
          });
      });
  }
}

async function botInfo(interaction) {
  const uptimeDays = client.uptime / 86400000;
  let serverCount;
  await client.shard.fetchClientValues('guilds.cache.size')
	.then(results => {
		serverCount = results.reduce((acc, guildCount) => acc + guildCount);
	})
	.catch(console.error);
  const botInfoEmbed = new Discord.MessageEmbed()
    .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .setTitle("Orbital Info")
    .addField(`Servers`, `${serverCount}`, true)
    .addField(`Uptime`, `${uptimeDays.toFixed(1)} days`, true)
    .addField('\u200b', '\u200b')
    .addField(`Invite Link`, `[Click here!](https://adat.link/orbital)`, true)
    .addField(`GitHub Link`, `[Click here!](https://github.com/ADawesomeguy/nasa-bot)`, true)
    .setFooter(embedInfo.footer[0], embedInfo.footer[1])
    .setColor(`${embedInfo.color}`)
    .setTimestamp();
  interaction.reply({ embeds: [botInfoEmbed] });
}

client.login(token);
