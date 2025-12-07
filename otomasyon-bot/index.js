const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const config = require("./config.json");

const client = new Client({
   intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]

});

// Prefix
const prefix = config.prefix;

// Komut koleksiyonu
client.commands = new Collection();

// Slash komutlarını yükle (istersen kaldırabilirsin)
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Slash komut çalıştırıcı
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (err) {
        console.error(err);
    }
});


// ⭐ ANA SUNUCUDAN ÇIKANLARI YAN SUNUCUDAN BANLA + LOG + DM
client.on("guildMemberRemove", async member => {
    if (member.guild.id !== config.mainGuildId) return;

    const mainGuild = client.guilds.cache.get(config.mainGuildId);
    const secondaryGuild = client.guilds.cache.get(config.secondaryGuildId);
    const logChannel = mainGuild.channels.cache.get(config.logChannelId);

    if (!secondaryGuild) return console.log("❌ Yan sunucu bulunamadı.");

    try {
        // 🚫 Kullanıcıyı yan sunucudan banla
        await secondaryGuild.members.ban(member.id, {
            reason: "Ana sunucudan ayrıldı (Otomatik Sistem)"
        });

        console.log(`${member.user.tag} otomatik olarak yan sunucudan banlandı.`);

        // 📩 Kullanıcıya DM gönder
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("🚫 Sunucudan Yasaklandın")
                .setDescription(
                    `**${mainGuild.name}** adlı ana sunucudan ayrıldığın için,\n` +
                    `**${secondaryGuild.name}** adlı yan sunucudan **otomatik olarak yasaklandın.**\n\n` +
                    `Bir hata olduğunu düşünüyorsan yetkililere ulaşabilirsin.`
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            await member.send({ embeds: [dmEmbed] });
        } catch {
            console.log("❗ Kullanıcıya DM gönderilemedi.");
        }

        // 📝 Log kanalına embed gönder
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor("DarkRed")
                .setTitle("🚫 Otomatik Ban Sistemi")
                .setDescription(`Bir kullanıcı ana sunucudan çıkınca yan sunucudan **banlandı**.`)
                .addFields(
                    { name: "👤 Kullanıcı", value: `${member.user.tag} (${member.id})` },
                    { name: "📤 Çıktığı Sunucu", value: mainGuild.name },
                    { name: "🔨 Yasaklandığı Sunucu", value: secondaryGuild.name }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();

            logChannel.send({ embeds: [logEmbed] });
        }

    } catch (err) {
        console.error("Ban atılamadı:", err);
    }
});


// ❗ PREFIXLİ BAN AFFI KOMUTU
client.on("messageCreate", async message => {
    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "ban-affı") {
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("❌ Bu komutu kullanmak için **Yönetici** iznine sahip olmalısın.");
        }

        const secondaryGuild = client.guilds.cache.get(config.secondaryGuildId);
        if (!secondaryGuild) return message.reply("❌ Yan sunucu bulunamadı.");

        // Embed
        const unbanEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("🔓 Toplu Ban Affı Uygulandı!")
            .setDescription(`**${secondaryGuild.name}** adlı sunucudaki **tüm banlı kullanıcıların yasağı kaldırıldı.**`)
            .setTimestamp();

        try {
            const bans = await secondaryGuild.bans.fetch();

            for (const ban of bans.values()) {
                await secondaryGuild.members.unban(ban.user.id, "Yönetici tarafından ban affı");
            }

            message.reply({ embeds: [unbanEmbed] });

        } catch (err) {
            console.error(err);
            message.reply("❌ Banlar kaldırılırken bir hata oluştu.");
        }
    }
});


// 🎥 Yayın Durumu
client.once("ready", () => {
    console.log(`${client.user.tag} aktif!`);

    client.user.setPresence({
        activities: [
            {
                name: "Shadex🍺Worex Inc",
                type: 1,
                url: "https://twitch.tv/KanLanDum"
            }
        ],
        status: "online"
    });
});

client.login(config.token);
