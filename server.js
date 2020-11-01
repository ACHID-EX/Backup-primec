//UPTIME MUNGKIN
const http = require("http");
const express = require("express");
const app = express();

var server = require("http").createServer(app);
app.get("/", (request, response) => {
  console.log(`Ping Received`);
  response.sendStatus(200);
});
const listener = server.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
setInterval(() => {
  http.get(`${process.env.PROJECT_DOMAIN}`);
}, 86400000);
//_______________________________________________________________________________________________________________________________
//PACKAGE REQUIRE
const discord = require("discord.js");
const { TOKEN, DEFAULT_PREFIX } = require("./config.json");
const db = require("quick.db");
const { addexp } = require("./handlers/xp.js"); //Tambahan handler xp -1
const client = new discord.Client({
  disableEveryone: true
});
//_____________________________________________________________________________________________________________________________
//BOT STATUS
client.on("ready", async () => {
  console.log(`${client.user.tag} sudah aktif!`);
  let status = [
    `${client.users.cache.size} Pengguna!`,
    `${client.guilds.cache.size} Server!`,
    `@primec.community`
  ];

  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random], {
      type: "STREAMING"
    });
  }, 6000);
});

//________________________________________________________________________________________________________________________________
//DUKUNGAN SNIPE
client.snipes = new Map();
client.on("messageDelete", function(message, channel) {
  client.snipes.set(message.channel.id, {
    conetnt: message.content,
    author: message.author.tag,
    image: message.attachments.first()
      ? message.attachments.first().proxyURL
      : null
  });
});

//________________________________________________________________________________________________________________________________
//KOLEKSI
client.commands = new discord.Collection();
client.aliases = new discord.Collection();

const { CanvasSenpai } = require("canvas-senpai");
const canva = new CanvasSenpai();

["command"].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});

client.on("message", async message => {
  //_____________________________________________________________pesan__________________________________________________________________________
  if (message.content === "welcome")
    message.channel.send("Selamat datang semoga anda nyaman dan betah :pray:");

  if (message.content === "Welcome")
    message.channel.send("Selamat datang semoga anda nyaman dan betah :pray:");

  if (message.content === "welcome")
    message.channel.send(
      "<a:pikachees:772097162322378792><a:DingDing:772097626480312360><a:sugoi:772097993817849887><a:NaNaNa:772098032388538389>"
    );

  if (message.content === "Welcome")
    message.channel.send(
      "<a:pikachees:772097162322378792><a:DingDing:772097626480312360><a:sugoi:772097993817849887><a:NaNaNa:772098032388538389>"
    );

  //_____________________________________________________________prefix_________________________________________________________________________
  if (!message.guild) return;
  let prefix = db.get(`prefix_${message.guild.id}`);
  if (prefix === null) prefix = DEFAULT_PREFIX;

  let blacklist = await db.fetch(`blacklist_${message.author.id}`);

  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  if (blacklist === "Blacklisted")
    return message.reply("You are blacklisted from the bot!");

  // Jika message.member tidak di-cache, simpan dalam cache.
  if (!message.member)
    message.member = await message.guild.fetchMember(message);

  let args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);
  let cmd = args.shift().toLowerCase();

  if (cmd.length === 0) return;

  // Dapatkan perintahnya
  let command = client.commands.get(cmd);
  // Jika tidak ada yang ditemukan, coba cari dengan alias
  if (!command) command = client.commands.get(client.aliases.get(cmd));

  // Jika perintah akhirnya ditemukan, jalankan perintah
  if (command) command.run(client, message, args);

  console.log(`${message.author.tag} menggunakan command ${prefix}${cmd}`);

  //Tambahan handler xp -2
  return addexp(message);
});

//_____________________________________________Welcome channel_____________________________________________________________________
client.on("guildMemberAdd", async member => {
  //<<< EVENT DISINI
  let chx = db.get(`welchannel_${member.guild.id}`);

  if (chx === null) {
    return;
  }

  let data = await canva.welcome(member, {
    link:
      "https://cdn.discordapp.com/attachments/757199039501697044/766673149160194113/IMG_20201016_214459_1.jpg"
  });

  const attachment = new discord.MessageAttachment(data, "welcome-image.png");

  client.channels.cache
    .get(chx)
    .send("``Welcome to server`` " + member.user.toString(), attachment);
});

//____________________________________________Goodbye channel______________________________________________________________________
client.on("guildMemberRemove", member => {
  let chx = db.get(`leavchannel_${member.guild.id}`);

  if (chx === null) {
    return;
  }

  let wembed = new discord.MessageEmbed()
    .setAuthor(member.user.username, member.user.avatarURL())
    .setColor("#d3c9c4")
    .setThumbnail(member.user.displayAvatarURL())
    .setDescription(`Goodbye ${member}`);
});
//_________________________________________________________________________________________________________________________________

client.login(TOKEN);
