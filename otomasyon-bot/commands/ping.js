const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Bot gecikmesini gösterir."),

    async execute(interaction, client) {

        const ping = client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("🏓 Pong!")
            .addFields({ name: "Gecikme", value: `\`${ping}ms\`` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
