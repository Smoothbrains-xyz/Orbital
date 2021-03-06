/* ENV VARIABLES
*  TOKEN: Bot token
*  NASA_API_KEY: NASA API Key
*  CHROMIUM_PATH: Path to Chromium executable
*  NEWS_API_KEY: API key for news
*  MONGODB_URI: URI for MongoDB if needed
*/
require('dotenv').config()

const Discord = require('discord.js');
const client = new Discord.Client({
  intents: ["GUILD_PRESENCES", "GUILD_MEMBERS", "GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS"],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

const axios = require('axios');
const mongoose = require('mongoose');
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

const ownerarray = ['745063586422063214', '756289468285190294'];

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
      console.log("Connected to DB!");
    })
    .catch(console.error);
}

client.once('ready', () => {
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
  client.user.setPresence({
    activities: [
      {
        name: "the night sky • /help",
        type: "WATCHING",
        url: "https://github.com/ADawesomeguy/nasa-bot"
      }
    ]
  });
});

client.on('messageCreate', async message => {
  if (message.content.toLowerCase() === '!deploy' && ownerarray.includes(message.author.id)) {
    // Register slash commands globally (set them every time you change slashcommands.json);
    await client.application.commands.set(slashCommands)
      .then(commands => {
        message.delete();
        message.author.send("Started updating slash commands...");
      });
  }

  /*if (message.content.toLowerCase() === '!paginator') {
    const arrays = [];
    for (let i = 0; i < 10; i++) {
      arrays.push(new Discord.MessageEmbed().setTitle(`${i}`));
    }
    paginator(message.author, message.channel, arrays);
  }*/
});

client.on("interactionCreate", interaction => {
  // If the interaction isn't a slash command, return
  if (!interaction.isCommand() && !interaction.isButton() && !interaction.isSelectMenu()) return;

  if (interaction.isCommand()) {
    // Switch between categories and uncategorized commands
    switch (interaction.commandName) {
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
    switch (interaction.customId) {
      case "another-natural":
        epic(interaction, false);
        break;
      case "another-enhanced":
        epic(interaction, true);
        break;
    }
  } else if (interaction.isSelectMenu()) {
    switch (interaction.customId) {
    }
  }
});

async function qrcodeSwitch(interaction) {
  switch (interaction.options.getSubcommand()) {
    case "read":
      qrcode(true, interaction);
      break;
    case "create":
      qrcode(false, interaction);
      break;
  }
}

async function space(interaction) {
  switch (interaction.options.getSubcommand()) {
    case "apod":
      apod(interaction);
      break;
    case "iss":
      iss(interaction);
      break;
    case "epic":
      epic(interaction, interaction.options.get('enhanced').value);
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
  switch (interaction.options.getSubcommand()) {
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
  switch (interaction.options.getSubcommand()) {
    case "thread":
      thread(interaction);
      break;
    case "emoji":
      createEmoji(interaction);
      break;
    case "sticker":
      createSticker(interaction);
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
    } else if (!guildidpremarray.includes(interaction.guild.id)) {
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

      interaction.reply({ embeds: [apodEmbed] })
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
  const embeds = [];
  slashCommands.forEach(async slashCommand => {
    const helpEmbed = new Discord.MessageEmbed()
      .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor("ffffff")
      .setFooter(embedInfo.footer[0], embedInfo.footer[1])
      .setTimestamp();
    let commandInfo = `${slashCommand.description}`;
    if (slashCommand.options) {
      commandInfo += `\nOptions:`
      slashCommand.options.forEach(option => {
        const name = option.name;
        const description = option.description;
        let type;
        switch (option.type) {
          case 1:
            type = "Subcommand";
            break;
          case 2:
            type = "Subcommand Group";
            break;
          case 3:
            type = "String";
            break;
          case 4:
            type = "Integer";
            break;
          case 5:
            type = "Boolean";
            break;
          case 6:
            type = "User";
            break;
          case 7:
            type = "Channel";
            break;
          case 8:
            type = "Role";
            break;
          case 9:
            type = "Mentionable";
            break;
        }
        commandInfo += `\n> Type: \`${type}\`\n> Name: \`${name}\`\n> Description: \`${description}\`\n`;
        if (option.options) {
          option.options.forEach(suboption => {
            //commandInfo += `\n${suboption.type}\n${suboption.name}\n${suboption.description}`
          });
        }
      });
    }

    helpEmbed.addField("/" + slashCommand.name, `${commandInfo}`);
    embeds.push(helpEmbed);
  });
  paginator(interaction.user, interaction, embeds);
  //interaction.reply({ embeds: [helpEmbed] });
}

async function thread(interaction) {
  if (interaction.member.permissions.has("MANAGE_CHANNELS")) {
    const name = interaction.options.get("thread").options.get("name").value
    const reason = interaction.options.get("thread").options.get("reason").value
    const author = `<@${interaction.member.user.id}>`
    const chan = await interaction.channel.threads.create({ name: name, autoArchiveDuration: 1440, reason: reason, }).catch(console.error)
    chan.members.add(interaction.member, "Created Thread")

    const threadEmbed = new Discord.MessageEmbed()
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
    .setTitle("🏓 Pong!")
    .addField(`Ping:`, `${Date.now() - interaction.createdAt}ms`)
    .addField(`API:`, `${Math.round(client.ws.ping)}ms`)
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
              .setCustomId('another-natural')
              .setLabel('Another!')
              .setStyle('SECONDARY');

            interaction.followUp({ embeds: [epicNaturalEmbed], components: [new Discord.MessageActionRow().addComponents(anotherButton)] });
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
              .setCustomId('another-enhanced')
              .setLabel('Another!')
              .setStyle('SECONDARY');

            interaction.followUp({ embeds: [epicEnhancedEmbed], components: [new Discord.MessageActionRow().addComponents(anotherButton)] });
          });
      });
  }
}

async function serverInfo(interaction) {
  const guild = interaction.guild;
  await guild.members.fetch();
  await guild.roles.fetch();
  const textChannelCount = guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').size;
  const voiceChannelCount = guild.channels.cache.filter(c => c.type === 'GUILD_VOICE').size;
  const categoryChannelCount = guild.channels.cache.filter(c => c.type === 'GUILD_CATEGORY').size;
  const announcementChannelCount = guild.channels.cache.filter(c => c.type === 'GUILD_NEWS').size;
  const numHumans = guild.members.cache.filter(member => !member.user.bot).size;
  const numBots = guild.members.cache.filter(member => member.user.bot).size;
  const numRoles = guild.roles.cache.size;
  /*const numOnline = guild.members.cache.filter(member => member.presence.status === "online" && !member.user.bot).size;
  const numOffline = guild.members.cache.filter(member => member.presence.status === "offline" && !member.user.bot).size;
  const numAway = guild.members.cache.filter(member => member.presence.status === "idle" && !member.user.bot).size;
  const numDND = guild.members.cache.filter(member => member.presence.status === "dnd" && !member.user.bot).size;*/
  const serverInfoEmbed = new Discord.MessageEmbed()
    .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .setTitle(`**${guild.name}** Info`)
    .addField("Owner", `<@${guild.ownerId}>`, true)
    //.addField("Region", guild.region, true)
    .addField("Verification Level", guild.verificationLevel, true)
    .addField("Channels", `Total: ${guild.channels.cache.size} ‖ Announcement: ${announcementChannelCount} • Text: ${textChannelCount} • Voice: ${voiceChannelCount} • Categories: ${categoryChannelCount}`)
    .addField("Members", `Total: ${numHumans + numBots} ‖ Human: ${numHumans} • Bot: ${numBots}`)
    .addField("Roles", `${numRoles}`)
    .addField("Created", `<t:${Math.round(guild.createdTimestamp / 1000)}:R>`)
    //.addField("User Statuses", `🟦 • ${numOnline} online\n\n🟧 • ${numAway} away\n\n⬛ • ${numOffline} offline\n\n🟥 • ${numDND} DND`)
    .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
    .setFooter(embedInfo.footer[0], embedInfo.footer[1])
    .setColor(`${embedInfo.color}`)
    .setTimestamp();
  interaction.reply({ embeds: [serverInfoEmbed] })
}

async function memberInfo(interaction) {
  const member = interaction.options.get('member').member;
  console.log(member);

  const memberInfoEmbed = new Discord.MessageEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .addField("Roles", member.roles.cache.map(r => `${r}`).join(' • '))
    .addField("Permissions", member.permissions.toArray().map(p => `\`${p}\``.toLowerCase()).join(' • '))
    .addField("Joined", `<t:${Math.round(member.joinedTimestamp / 1000)}:R>`, true)
    .addField("Account created", `<t:${Math.round(member.user.createdTimestamp / 1000)}:R>`, true)
    .setFooter(embedInfo.footer[0], embedInfo.footer[1])
    .setColor(`${embedInfo.color}`)
    .setTimestamp();

  interaction.reply({ embeds: [memberInfoEmbed] });
}

async function roleInfo(interaction) {
  const role = interaction.options.get('role').role;

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
  await axios.get(`http://api.wolframalpha.com/v2/query?input=${interaction.options.get('query').value}&appid=${process.env.WOLFRAM_API_KEY}`)
    .then(async response => {
      data = response.data;
      parseString(data, async (err, result) => {
        if (result.queryresult.pod) {
          const wolframEmbed = new Discord.MessageEmbed()
            .setTitle(`Results for \`${interaction.options.get('query').value}\``)
            .setColor(embedInfo.color);

          const menuOptions = [];
          result.queryresult.pod.forEach(p => {
            menuOptions.push({
              label: p.$.title.length >= 25 ? p.$.title.slice(0, 21) + "..." : p.$.title,
              value: p.$.title
            });
          });

          const selectMenu = new Discord.MessageSelectMenu()
            .setCustomId('wolfram-results')
            .setPlaceholder('Results')
            .addOptions(menuOptions)

          const interactionMessage = await interaction.followUp({ content: "Results:", components: [new Discord.MessageActionRow().addComponents(selectMenu)] });

          const filter = i => {
            i.deferUpdate();
            return i.user.id === interactionMessage.interaction.user.id;
          };

          const collector = interactionMessage.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU' });

          collector.on('collect', async i => {
            result.queryresult.pod.forEach(p => {
              if (p.$.title === i.values[0]) {
                const embeds = [];
                p.subpod.forEach(s => {
                  const embed = new Discord.MessageEmbed()
                    .setTitle(i.values['0'])
                    .setImage(s.img[0].$.src)
                    .setColor(embedInfo.color);
                  embeds.push(embed);
                });
                i.message.reply({ embeds: embeds });
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
  const qrcodeData = interaction.options.getSubcommand() === 'create' ? interaction.options.get('data').value : interaction.options.get('url').value;
  let qrcodeURL;
  isRead ? qrcodeURL = urls.qrcode_read : qrcodeURL = urls.qrcode_create;

  if (isRead) {
    await axios.get(`${qrcodeURL}${qrcodeData}`)
      .then(response => {
        data = response.data;
        if (data[0].symbol[0].error) {
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
      multiplier = 1;
      break;
    case "minutes":
      multiplier = 60;
      break;
    case "hours":
      multiplier = 3600;
      break;
    case "days":
      multiplier = 86400;
      break;
    case "weeks":
      multiplier = 604800;
      break;
    case "months":
      multiplier = 2629800;
      break;
    case "years":
      multiplier = 31557600;
      break;
  }

  const totalSeconds = interaction.options.get('amount').value * multiplier;
  const finalDate = Math.round(Date.now() / 1000 + totalSeconds);
  const reminderOverviewEmbed = new Discord.MessageEmbed()
    .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .setTitle("Reminder Created")
    .addField("User", `${interaction.user.tag}`)
    .addField("Date", `Reminding you <t:${finalDate}:R> about \`${reason}\``)
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
  }, totalSeconds * 1000);
}

async function marsWeather(interaction) {
  interaction.defer();
  axios.get("https://mars.nasa.gov/layout/embed/image/mslweather/")
    .then(async response => {
      data = response.data.replace(/src="\//g, "src=\"https://mars.nasa.gov/").replace(/href="\//g, "href=\"https://mars.nasa.gov/");
      const images = await nodeHtmlToImage({
        html: data,
        puppeteerArgs: {
          executablePath: process.env.CHROMIUM_PATH,
          defaultViewport: { width: 1920, height: 1080 }
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

async function createEmoji(interaction) {
  interaction.defer();

  if (!interaction.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return interaction.followUp({ content: "You do not have the \"Manage Emojis and Stickers\" permission!" });

  const url = interaction.options.get("url").value;
  const name = interaction.options.get("name").value;

  let reason;
  if (interaction.options.get("reason")) reason = interaction.options.get("reason").value;

  interaction.guild.emojis.create(url, name, { reason: reason ? reason : "Not specified" })
    .then(emoji => {
      const emojiCreationEmbed = new Discord.MessageEmbed()
        .setDescription(`Emoji "${emoji}" created with name \`${emoji.name}\``)
        .setColor(embedInfo.color);
      interaction.followUp({ embeds: [emojiCreationEmbed] });
    })
    .catch(error => {
      if (error) interaction.followUp({ content: `Invalid image: likely the link does not point to an image or the image is too large/the wrong format.` });
    });
}

async function createSticker(interaction) {
  interaction.defer();

  if (!interaction.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return interaction.followUp({ content: "You do not have the \"Manage Emojis and Stickers\" permission!" });

  const url = interaction.options.get("url").value;
  const name = interaction.options.get("name").value;

  let reason;
  if (interaction.options.get("reason")) reason = interaction.options.get("reason").value;

  interaction.guild.stickers.create(url, name, { reason: reason ? reason : "Not specified" })
    .then(sticker => {
      const stickerCreationEmbed = new Discord.MessageEmbed()
        .setDescription(`Sticker "${sticker}" created with name \`${sticker.name}\``)
        .setColor(embedInfo.color);
      interaction.followUp({ embeds: [stickerCreationEmbed] });
    })
    .catch(error => {
      if (error) interaction.followUp({ content: `Invalid image: likely the link does not point to an image or the image is too large/the wrong format.` });
    });
}

async function paginator(user, interaction, embeds) {
  let index = 0;

  const row = new Discord.MessageActionRow();
  row.addComponents(
    new Discord.MessageButton()
      .setCustomId('paginator-left')
      .setEmoji('868552005977788466')
      .setStyle('SECONDARY'),
    new Discord.MessageButton()
      .setCustomId('paginator-right')
      .setEmoji('868551772887711754')
      .setStyle('SECONDARY')
  );

  await interaction.reply({ content: `Page 1 of ${embeds.length}:`, embeds: [embeds[index]], components: [row] })
    .then(async () => {
      const paginatorMessage = await interaction.fetchReply();
      const filter = i => {
        i.deferUpdate();
        return i.user.id === user.id;
      }

      const paginatorCollector = paginatorMessage.createMessageComponentCollector({ filter, componentType: "BUTTON" });

      paginatorCollector.on('collect', async i => {
        switch (i.customId) {
          case 'paginator-left':
            index--;
            if (index < 0) index = embeds.length - 1;
            break;
          case 'paginator-right':
            index++;
            if (index > embeds.length - 1) index = 0;
            break;
        }
        paginatorMessage.edit({ content: `Page ${index + 1} of ${embeds.length}:`, embeds: [embeds[index]] });
      });
    });
}

client.login(token);
