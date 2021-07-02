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
const parseString = require('xml2js').parseString;
require('dotenv').config();

const urls = require('./config/urls.json');
const slashCommands = require('./config/slashcommands.json')
let embedInfo;

const nasaApiKey = process.env.NASA_API_KEY;
const token = process.env.TOKEN;
const newsapi = process.env.NEWS_API_KEY;
// client.on('message', () => {

// })
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
  if (!interaction.isCommand() && !interaction.isButton()) return;

  if (interaction.isCommand()) {
    // Switch between categories and uncategorized commands
    switch(interaction.commandName) {
      case "space":
        space(interaction);
        break;
      case "news":
        news(interaction);
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
      case "data":
        data(interaction);
        break;
      case "wolfram":
        wolfram(interaction);
        break;
    } // End interaction command name switch
  } else if (interaction.isButton()) {
    switch(interaction.customID) {
      case "another-natural":
        epic(interaction, false);
        break;
      case "another-enhanced":
        epic(interaction, true);
        break;
    }
  }
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
      epic(interaction, interaction.options.first().options.first().value);
      break;
  }
}

async function data(interaction) {
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
    .addField(`Links`, `[\`Invite\`](https://adat.link/orbital) [\`GitHub\`](https://github.com/ADawesomeguy/nasa-bot)`, true)
    .setFooter(embedInfo.footer[0], embedInfo.footer[1])
    .setColor(`${embedInfo.color}`)
    .setTimestamp();
  interaction.reply({ embeds: [botInfoEmbed] });
}

async function info(interaction) {
  switch(interaction.options.first().name) {
    case "server":
      serverInfo(interaction);
      break;
    case "member":
      memberInfo(interaction);
      break;
    case "role":
      roleInfo(interaction);
      break;
  }
}

async function news(interaction) {
  const row = new Discord.MessageActionRow()
      .addComponents(
          new Discord.MessageSelectMenu()
              .setCustomID('select')
              .setPlaceholder('Nothing selected')
              .addOptions([
                  {
                      label: 'US News',
                      description: 'View US News',
                      value: 'us-news',
                  },
                  {
                      label: 'Finance',
                      description: 'View US Finance News',
                      value: 'finance',
                  },
                  {
                      label: 'Sports',
                      description: 'View US Sports News',
                      value: 'sports',
                  },
              ]),
      );

  await interaction.reply({ content: 'News Options:', components: [row] });

  client.on('interaction', async interaction => {
      if (!interaction.isSelectMenu()) return;

      if (interaction.customID === 'select') {
          await interaction.defer()
          if (interaction.values[0] === "us-news") {
          const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=d97d280008ad4692bc287045547077a3`
          const results = await axios.get(url)
          const info = results.data.articles;
          const random = Math.floor(Math.random() * info.length);
          const randObject = info[random];
    if (randObject.urlToImage === null || !randObject.urlToImage) {
            const newsEmbed = new Discord.MessageEmbed()
                    .setTitle(`${randObject.title}`)
                    .setAuthor(`${randObject.author}`, `${client.user.displayAvatarURL({ dynamic: true, size: 1024 })}`)
                    .setDescription(`**Description**: \n${randObject.description}`)
                    .addField("Country:", `United States of America`)
                    .addField(`URL:`, `[Link](${randObject.url})`, true)
                    .addField("Source:", `${randObject.source.name}`)
                    .setColor(`${embedInfo.color}`)
                    .setFooter(embedInfo.footer[0], embedInfo.footer[1])
                    .setTimestamp();

                  await interaction.editReply({ content: 'US News:', components: [], embeds: [newsEmbed] });
              // await interaction.editReply({ content: `Article: ${randObject.title}\nWritten By: ${randObject.author}\nURL: ${randObject.url}\nDescription: ${randObject.description}\nSource: ${randObject.source.name}\n`, components: [] });
          } else if (randObject.urlToImage) {
            const newsEmbedMedia = new Discord.MessageEmbed()
                    .setTitle(`${randObject.title}`)
                    .setAuthor(`${randObject.author}`, `${client.user.displayAvatarURL({ dynamic: true, size: 1024 })}`)
                    .setThumbnail(`${randObject.urlToImage}`)
                    .setDescription(`**Description**: \n${randObject.description}`)
                    .addField("Country:", `United States of America`)
                    .addField(`URL:`, `[Link](${randObject.url})`, true)
                    .addField("Source:", `${randObject.source.name}`)
                    .setColor(`${embedInfo.color}`)
                    .setFooter(embedInfo.footer[0], embedInfo.footer[1])
                    .setTimestamp();

                    await interaction.editReply({ content: 'US News:', components: [], embeds: [newsEmbedMedia] });
            // await interaction.editReply({ content: `Article: ${randObject.title}\nWritten By: ${randObject.author}\nURL: ${randObject.url}\nDescription: ${randObject.description}\nSource: ${randObject.source.name}`, components: [] });
        } else if (interaction.values[0] === "finance") {
              await interaction.editReply({ content: 'Finance was Selected!', components: [] });
          } else if (interaction.values[0] === "sports") {
            await interaction.editReply({ content: 'Sports was Selected!', components: [] });
        }
      }
    }
  });
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

async function epic(interaction, isEnhanced) {
  // If "enhanced" is false
  if (!isEnhanced) {
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

            const anotherButton = new Discord.MessageButton()
              .setCustomID('another-natural')
              .setLabel('Another!')
              .setStyle('SECONDARY');

            interaction.reply({ embeds: [epicNaturalEmbed], components: [[anotherButton]] });
          });
      });
  // If "enhanced" is true
  } else if (isEnhanced) {
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

            const anotherButton = new Discord.MessageButton()
              .setCustomID('another-enhanced')
              .setLabel('Another!')
              .setStyle('SECONDARY');

            interaction.reply({ embeds: [epicEnhancedEmbed], components: [[anotherButton]] });
          });
      });
  }
}

async function serverInfo(interaction) {
  const guild = interaction.guild;
  await guild.members.fetch();
  await guild.roles.fetch();
  const textChannelCount = guild.channels.cache.filter(c => c.type === 'text').size;
  const voiceChannelCount = guild.channels.cache.filter(c => c.type === 'voice').size;
  const categoryChannelCount = guild.channels.cache.filter(c => c.type === 'category').size;
  const numHumans = guild.members.cache.filter(member => !member.user.bot).size;
  const numBots = guild.members.cache.filter(member => member.user.bot).size;
  const numRoles = guild.roles.cache.size;
  const numOnline = guild.members.cache.filter(member => member.user.presence.status === "online" && !member.user.bot).size;
  const numOffline = guild.members.cache.filter(member => member.user.presence.status === "offline" && !member.user.bot).size;
  const numAway = guild.members.cache.filter(member => member.user.presence.status === "idle" && !member.user.bot).size;
  const numDND = guild.members.cache.filter(member => member.user.presence.status === "dnd" && !member.user.bot).size;
  const serverInfoEmbed = new Discord.MessageEmbed()
    .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .setTitle(`**${guild.name}** Info`)
    .addField("Owner", `<@${guild.ownerID}>`, true)
    //.addField("Region", guild.region, true)
    .addField("Verification Level", guild.verificationLevel, true)
    .addField("Channels", `Total: ${guild.channels.cache.size} ‖ Text: ${textChannelCount} • Voice: ${voiceChannelCount} • Categories: ${categoryChannelCount}`)
    .addField("Members", `Total: ${numHumans + numBots} ‖ Human: ${numHumans} • Bot: ${numBots}`)
    .addField("Roles", `${numRoles}`)
    .addField("Created", `${new Date(guild.createdTimestamp).toLocaleString("en-US", {timeZoneName: "short"})}`)
    .addField("User Statuses", `🟦 • ${numOnline} online\n\n🟧 • ${numAway} away\n\n⬛ • ${numOffline} offline\n\n🟥 • ${numDND} DND`)
    .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
    .setFooter(embedInfo.footer[0], embedInfo.footer[1])
    .setColor(`${embedInfo.color}`)
    .setTimestamp();
  interaction.reply({ embeds: [serverInfoEmbed] })
}

async function memberInfo(interaction) {
  const member = interaction.options.first().options.first().member;

  const memberInfoEmbed = new Discord.MessageEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .addField("Roles", member.roles.cache.map(r => `${r}`).join(' • '))
    .addField("Permissions", member.permissions.toArray().map(p => `\`${p}\``.toLowerCase()).join(' • '))
    .addField("Joined at", `${new Date(member.joinedTimestamp).toLocaleString("en-US", {timeZoneName: "short"})}`, true)
    .addField("Account created", `${new Date(member.user.createdTimestamp).toLocaleString("en-US", {timeZoneName: "short"})}`, true)
    .setFooter(embedInfo.footer[0], embedInfo.footer[1])
    .setColor(`${embedInfo.color}`)
    .setTimestamp();

  interaction.reply({ embeds: [memberInfoEmbed] });
}

async function roleInfo(interaction) {
  const role = interaction.options.first().options.first().role;

  const roleInfoEmbed = new Discord.MessageEmbed()
    .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .setTitle(`**${role.name}** Info`)
    .addField("Permissions", role.permissions.toArray().map(p => `\`${p}\``.toLowerCase()).join(' • '))
    .addField("Mentionable", `${role.mentionable}`)
    .setFooter(embedInfo.footer[0], embedInfo.footer[1])
    .setColor(`${embedInfo.color}`)
    .setTimestamp();

  interaction.reply({ embeds: [roleInfoEmbed] });
}

async function wolfram(interaction) {
  interaction.defer();
  await axios.get(`http://api.wolframalpha.com/v2/query?input=${interaction.options.first().value}&appid=${process.env.WOLFRAM_API_KEY}`)
    .then(async response => {
        data = response.data;
        parseString(data, async (err, result) => {
          const wolframEmbed = new Discord.MessageEmbed()
            .setTitle(`Results for \`${interaction.options.first().value}\``)
            .setColor(embedInfo.color);
          const resultButtons = [];
          if (result.queryresult.pod) {
            result.queryresult.pod.forEach(p => {
              const button = new Discord.MessageButton()
                .setCustomID(p.$.title)
                .setLabel(p.$.title)
                .setStyle('SECONDARY');
              resultButtons.push(button);
            });
            resultButtons.splice(5)
            const interactionMessage = await interaction.followUp({ embeds: [wolframEmbed], components: [resultButtons] });

            const filter = i => i.message.id === interactionMessage.id;

            const collector = interaction.channel.createMessageComponentInteractionCollector({ filter });

            collector.on('collect', async i => {
              result.queryresult.pod.forEach(p => {
                if (p.$.title === i.customID) {
                  const embeds = [];
                  p.subpod.forEach(s => {
                    const embed = new Discord.MessageEmbed()
                      .setTitle(i.customID)
                      .setImage(s.img[0].$.src)
                      .setColor(embedInfo.color);
                    embeds.push(embed);
                  });
                  i.reply({ embeds: embeds });
                }
              });
            });
          } else {
            interaction.followUp("No results!")
          }
        });
    })
    .catch(console.error)
}

client.login(token);
