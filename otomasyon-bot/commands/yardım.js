const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("yardım")
        .setDescription("Botun komutlarını gösterir."),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("📘 Yardım Menüsü")
            .setDescription("Aşağıda botun tüm komutları listelenmiştir:")
            .addFields(
                { name: "🔨 !ban-affı", value: "Sunucuda yasaklı olan herkesi affeder (Yönetici)." },
                { name: "🏓 /ping", value: "Botun gecikmesini gösterir." },
                { name: "📄 /yardım", value: "Bu menüyü gösterir." }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
