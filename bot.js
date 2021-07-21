/* ENV VARIABLES
*  TOKEN: Bot token
*  NASA_API_KEY: NASA API Key
*  CHROMIUM_PATH: Path to Chromium executable
*/
require('dotenv').config()

const Discord = require('discord.js');
const client = new Discord.Client({
  intents: ["GUILD_PRESENCES",  "GUILD_MEMBERS", "GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS"],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

const axios = require('axios');
const wait = require('util').promisify(setTimeout);
const parseString = require('xml2js').parseString;
const gitlog = require("gitlog").default;
const nodeHtmlToImage = require('node-html-to-image');
require('dotenv').config();

const urls = require('./config/urls.json');
const slashCommands = require('./config/slashcommands.json')
let embedInfo;

const nasaApiKey = process.env.NASA_API_KEY;
const token = process.env.TOKEN;
const newsapi = process.env.NEWS_API_KEY;

client.on('message', async message => {
  if (message.content.toLowerCase() === "!deploy") {
    client.application.commands.set(slashCommands)
      .then(() => {
        message.reply("Slash commands updated!");
      })
      .catch(console.error);
  }
});

client.once('ready', () => {
  // // Register slash commands globally (set them every time you change slashcommnads.json)
  //client.application.commands.set(slashCommands)

  // Log bot tag to console on start
  console.log(`Logged in as ${client.user.tag}!`);
  // Set embed info
  embedInfo = {
    color: "ffffff",
    footer: [
      `• ${client.user.tag}`,
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

client.on('messageCreate', async message => {
  if (message.content.toLowerCase() === '!deploy' && ownerarray.includes(message.author.id)) {
    // Register slash commands globally (set them every time you change slashcommands.json);
    await client.application.commands.set(slashCommands)
    message.channel.send("Started updating slash commands...")
    console.log("Updating Slash Commands...")
    }
  })

client.on("interactionCreate", interaction => {
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
      case "bob":
      bob(interaction);
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
      case "qrcode":
        qrcodeSwitch(interaction);
        break;
      case "remind":
        remind(interaction);
        break;
      case "create":
        create(interaction);
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

async function qrcodeSwitch(interaction) {
  switch(interaction.options.first().name) {
    case "read":
      qrcode(true, interaction);
      break;
    case "create":
      qrcode(false, interaction);
      break;
  }
}

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
    case "marsweather":
      marsWeather(interaction);
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
    .addField(`Links`, `[\`Invite\`](https://adat.link/orbital) [\`GitHub\`](https://github.com/Smoothbrains-dev/Orbital)`, true)
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
    case "changelog":
      changelog(interaction);
      break;
  } // End interaction command name switch
}

async function changelog(interaction) {
  const commits = gitlog({
    repo: __dirname,
    number: 5,
    fields: ["hash", "abbrevHash", "subject", "authorName", "authorDateRel"],
  });

  const changelogEmbed = new Discord.MessageEmbed()
    .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
    .setTitle("Changelog")
    .setColor(`${embedInfo.color}`)
    .setFooter(embedInfo.footer[0], embedInfo.footer[1])
    .setTimestamp();

  commits.forEach(commit => {
    changelogEmbed.addField(commit.abbrevHash, `> \`Hash:\`${commit.hash}\n> \`Subject:\`${commit.subject}\n> \`Author:\`${commit.authorName}\n> \`Date:\`${commit.authorDateRel}\n> \`Link\`: [GitHub](https://github.com/Smoothbrains-dev/Orbital/commit/${commit.hash})\n`);
  });

  interaction.reply({ embeds: [changelogEmbed] });
}

async function create(interaction) {
  switch(interaction.options.first().name) {
    case "thread":
      thread(interaction);
      break;
  }
}

async function news(interaction) {
  let customsearchvar = null;
  const row = new Discord.MessageActionRow()
      .addComponents(
          new Discord.MessageSelectMenu()
              .setCustomId('select')
              .setPlaceholder('Nothing selected')
              .addOptions([
                  {
                      label: 'US News',
                      description: 'View US News',
                      value: 'us-news',
                  },
                  {
                    label: 'Custom Search (PREMIUM)',
                    description: 'Search a topic and find news articles about it',
                    value: 'custom',
                  },
              ]),
      );

  await interaction.reply({ content: 'News Options:', components: [row] });
  }

  client.on('interactionCreate', async interaction => {
      if (!interaction.isSelectMenu()) return;
      if (interaction.customId === 'select') {
          await interaction.update({ components: [] });
          if (interaction.values[0] === "us-news") {
          const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${newsapi}`
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
        } 
        } else if (interaction.values[0] === "custom" && guildidpremarray.includes(interaction.guild.id)) {
          await interaction.editReply({ content: 'Type a topic to search for articles. *Time limit: 120 seconds*', components: [] });
            const collector = interaction.channel.createMessageCollector({
            max: '1',
            maxMatches: '10',
            time: '120000',
            errors: ['time']
          })
          collector.on('collect', async (m) => {
            if (typeof m.content === 'string') {
              customsearchvar = m.content;
              collector.stop;
            }

          if (typeof customsearchvar === 'string') {
            const url = `https://newsapi.org/v2/everything?q=${customsearchvar}&apiKey=${newsapi}`
            const results = await axios.get(url)
            const info = results.data.articles;
            const random = Math.floor(Math.random() * info.length);
            const randObject = info[random];
            const newcustomsearchvar = customsearchvar.charAt(0).toUpperCase() + customsearchvar.slice(1);
      if (randObject.urlToImage === null || !randObject.urlToImage) {
              const newsEmbed = new Discord.MessageEmbed()
                      .setTitle(`${randObject.title}`)
                      .setAuthor(`${randObject.author}`, `${client.user.displayAvatarURL({ dynamic: true, size: 1024 })}`)
                      .setDescription(`**Description**: \n${randObject.description}`)
                      .addField(`URL:`, `[Link](${randObject.url})`, true)
                      .addField("Source:", `${randObject.source.name}`)
                      .setColor(`${embedInfo.color}`)
                      .setFooter(embedInfo.footer[0], embedInfo.footer[1])
                      .setTimestamp();
                      
                    await interaction.followUp({ content: `${newcustomsearchvar} News Articles:`, components: [], embeds: [newsEmbed] });
            } else if (randObject.urlToImage) {
              const newsEmbedMedia = new Discord.MessageEmbed()
                      .setTitle(`${randObject.title}`)
                      .setAuthor(`${randObject.author}`, `${client.user.displayAvatarURL({ dynamic: true, size: 1024 })}`)
                      .setThumbnail(`${randObject.urlToImage}`)
                      .setDescription(`**Description**: \n${randObject.description}`)
                      .addField(`URL:`, `[Link](${randObject.url})`, true)
                      .addField("Source:", `${randObject.source.name}`)
                      .setColor(`${embedInfo.color}`)
                      .setFooter(embedInfo.footer[0], embedInfo.footer[1])
                      .setTimestamp();

                      //interaction.user.id is interaction author
                      await interaction.followUp({ content: `${newcustomsearchvar} News Articles:`, components: [], embeds: [newsEmbedMedia] });
        }
        }
      })
      } else if(!guildidpremarray.includes(interaction.guild.id)) {
        return await interaction.editReply({ content: 'Oops, seems like you do not have premium...', components: [] });
      }
    }
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
        .setFooter(embedInfo.footer[0], embedInfo.footer[1])
        .setColor(`${embedInfo.color}`)
        .setTimestamp();

      interaction.reply({ embeds: [apodEmbed]})
        .then(console.log)
	      .catch(console.error);
    })
    .catch(console.error);
}

async function iss(interaction) {
  interaction.defer();
  axios.get(`${urls.iss_location}`)
    .then(response => {
      data = response.data;
      const issEmbed = new Discord.MessageEmbed()
        .setTitle("The current location of the ISS!")
        .setURL('https://spotthestation.nasa.gov/tracking_map.cfm')
        .setImage(`https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s+000(${data.iss_position.longitude},${data.iss_position.latitude})/-87.0186,20,1/1000x1000?access_token=pk.eyJ1IjoiYWRhd2Vzb21lZ3V5IiwiYSI6ImNrbGpuaWdrYzJ0bGYydXBja2xsNmd2YTcifQ.Ude0UFOf9lFcQ-3BANWY5A`)
        .setFooter(embedInfo.footer[0], embedInfo.footer[1])
        .setColor("ffffff")
        .setFooter(`Bot ID: ${client.user.id}`)
        .setTimestamp();
      axios.get(`${urls.iss_astros}`)
        .then(response => {
          data = response.data;
          issEmbed.addField(`Astronauts`, `${data.people.map(e => e.name).join(" • ")}`);
          interaction.followUp({ embeds: [issEmbed] });
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

async function thread(interaction) {
  if (!interaction.use.permissions.has("MANAGE_CHANNELS")) {
  const name = interaction.options.get("thread").options.get("name").value
  const reason = interaction.options.get("thread").options.get("reason").value
  const author = `<@${interaction.member.user.id}>`
  const chan = await interaction.channel.threads.create({name: name, autoArchiveDuration: 1440, reason: reason,}).catch(console.error)
  chan.members.add(interaction.member, "Created Thread")

  const threadEmbed = new Discord.MessageEmbed()
    .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .setTitle("Thread Creation Status")
    .setDescription(`Successfully created Thread: __**${name}**__ by ${author}\n\nReason for thread creation: ${reason}\n\nThread will auto archive after no activity in 24 Hours`)
    .setColor(`${embedInfo.color}`)
    .setFooter(`This message will be autodeleted in 30 seconds ${embedInfo.footer[0]}`, embedInfo.footer[1])
    .setTimestamp();

  interaction.reply({ embeds: [threadEmbed] });
  await wait(30000) //Waits for 30 seconds
  interaction.deleteReply()
  .catch(console.error);
  } else {
    return interaction.reply("You do not have access to thread creation. Please make sure you have MANAGE_CHANNELS Permission");
  }
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
  interaction.defer();
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

            interaction.followUp({ embeds: [epicNaturalEmbed], components: [[anotherButton]] });
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

            interaction.followUp({ embeds: [epicEnhancedEmbed], components: [[anotherButton]] });
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

async function qrcode(isRead, interaction) {
  interaction.defer();
  const qrcodeData = interaction.options.first().options.first().value;
  let qrcodeURL;
  isRead ? qrcodeURL = urls.qrcode_read : qrcodeURL = urls.qrcode_create;

  if (isRead) {
    await axios.get(`${qrcodeURL}${qrcodeData}`)
      .then(response => {
        data = response.data;
        if (data[0].symbol[0].error){
          interaction.followUp({ content: data[0].symbol[0].error.charAt(0).toUpperCase() + data[0].symbol[0].error.slice(1) });
        } else {
          interaction.followUp({ content: data[0].symbol[0].data });
        }
      })
      .catch(error => interaction.followUp("Malformed URL"));
  } else {
    const qrcodeCreateEmbed = new Discord.MessageEmbed()
      .setImage(`${qrcodeURL}${qrcodeData}`)
      .setFooter(embedInfo.footer[0], embedInfo.footer[1])
      .setColor(`${embedInfo.color}`)
      .setTimestamp();

    interaction.followUp({ embeds: [qrcodeCreateEmbed] });
  }
}

async function remind(interaction) {
  if (interaction.options.get('amount').value <= 0) {
    interaction.reply('Invalid amount!');
    return;
  }

  let reason;
  interaction.options.get('reason') ? reason = interaction.options.get('reason').value : reason = "Not specified."

  let multiplier;
  // Unit to millisecond conversion
  switch (interaction.options.get('period').value) {
    case "seconds":
      multiplier = 1000;
      break;
    case "minutes":
      multiplier = 60000;
      break;
    case "hours":
      multiplier = 3600000;
      break;
    case "days":
      multiplier = 86400000;
      break;
    case "weeks":
      multiplier = 604800000;
      break;
    case "months":
      multiplier = 2629800000;
      break;
    case "years":
      multiplier = 31557600000;
      break;
  }

  const totalMs = interaction.options.get('amount').value * multiplier;
  const finalDate = new Date(Date.now() + totalMs);
  const reminderOverviewEmbed = new Discord.MessageEmbed()
    .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .setTitle("Reminder Created")
    .addField("User", `${interaction.user.tag}`)
    .addField("Date", finalDate.toString())
    .setFooter(embedInfo.footer[0], embedInfo.footer[1])
    .setColor(`${embedInfo.color}`)
    .setTimestamp();

  await interaction.reply({ embeds: [reminderOverviewEmbed] });

  setTimeout(() => {
    const reminderEmbed = new Discord.MessageEmbed()
      .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setTitle("Reminder")
      .addField("User", `${interaction.user.tag}`)
      .addField("Reason", `${reason}`)
      .setFooter(embedInfo.footer[0], embedInfo.footer[1])
      .setColor(`${embedInfo.color}`)
      .setTimestamp();

    interaction.followUp({ content: `<@${interaction.user.id}>`, embeds: [reminderEmbed] });
  }, totalMs);
}

async function marsWeather(interaction) {
  interaction.defer();
  axios.get("https://mars.nasa.gov/layout/embed/image/mslweather/")
    .then(async response => {
      data = response.data.replace(/src="\//g, "src=\"https://mars.nasa.gov/").replace(/href="\//g, "href=\"https://mars.nasa.gov/");
      const images = await nodeHtmlToImage({
        html: data,
        puppeteerArgs: {
          executablePath: process.env.CHROMIUM_PATH
        }
      });
      interaction.followUp({
        files: [{
          attachment: images,
          name: "file.jpg"
        }]
      });
    });
}

client.login(token);
