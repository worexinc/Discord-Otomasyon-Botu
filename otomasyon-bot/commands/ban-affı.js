const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");
const config = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban-affı")
        .setDescription("Yan sunucudaki tüm banları kaldırır.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        const secondaryGuild = client.guilds.cache.get(config.secondaryGuildId);
        if (!secondaryGuild) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("❌ Hata!")
                        .setDescription("Yan sunucu bulunamadı. Lütfen config.json dosyasını kontrol et.")
                ],
                ephemeral: true
            });
        }

        const bans = await secondaryGuild.bans.fetch();

        // 🚫 Ban yok embed
        if (bans.size === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Yellow")
                        .setTitle("🔍 Ban Bulunamadı")
                        .setDescription("Bu sunucuda banlanmış kimse bulunmuyor.")
                        .setTimestamp()
                ]
            });
        }

        // 🔥 Banları kaldır
        bans.forEach(async banInfo => {
            await secondaryGuild.bans.remove(banInfo.user.id, "Ban affı");
        });

        // ✔️ Başarılı embed
        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Ban Affı Uygulandı")
            .setDescription(`Toplam **${bans.size}** kişinin banı başarıyla kaldırıldı.`)
            .setFooter({ text: `Komutu kullanan: ${interaction.user.tag}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
