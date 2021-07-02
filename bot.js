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
const newsapi = process.env.NEWS_API_KEY;
// client.on('message', () => {
  
// })
client.once('ready', () => {
  // // Register slash commands globally
  // client.application.commands.set(slashCommands);

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
  switch (interaction.commandName) {
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

client.login(token);