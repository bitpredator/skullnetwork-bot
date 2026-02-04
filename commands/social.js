const { EmbedBuilder } = require('discord.js');

module.exports = async function handleSocialCommand(client, message) {
    const channel = client.channels.cache.get(process.env.SOCIAL_CHANNEL_ID);
    if (!channel) {
        return message.reply('❌ Canale social non trovato. Contatta un admin.');
    }

    const embed = new EmbedBuilder()
        .setTitle('🌐 Skull Network Italia - Social & Canali ufficiali')
        .setColor(0x2f3136)
        .setThumbnail('https://i.imgur.com/f2LxUyx.png') // Immagine alternativa funzionante
        .addFields(
            { name: '📌 Discord', value: '[Unisciti al nostro server](https://discord.gg/Jrm2Z26ad3)', inline: false },
            { name: '📘 Facebook', value: '[Pagina Facebook](https://www.facebook.com/profile.php?id=61578015786714)', inline: false },
            { name: '📺 YouTube', value: '[Canale YouTube](https://www.youtube.com/@SkullNetworkItalia)', inline: false },
            { name: '🎵 TikTok', value: '[TikTok ufficiale](https://www.tiktok.com/@skull_network_italia)', inline: false },
            { name: '📷 Instagram', value: '[Profilo Instagram](https://www.instagram.com/skull_networkitalia/)', inline: false },
            { name: '🚛 TrucksBook', value: '[Pagina TrucksBook](https://trucksbook.eu/company/211638)', inline: false },
            { name: '🚚 TruckersMP', value: '[Profilo TruckersMP](https://truckersmp.com/vtc/81767)', inline: false },
            { name: '🎮 Twitch Ufficiale', value: '[Bitpredator](https://www.twitch.tv/bitpredator)', inline: false }
        )
        .setFooter({ text: 'Skull Network Italia', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    await channel.send({ embeds: [embed] });
    await message.reply({ content: '✅ Social pubblicati nel canale dedicato!', ephemeral: true });
};
