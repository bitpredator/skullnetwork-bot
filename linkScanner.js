const fs = require('fs');
const path = require('path');
const forbiddenLinks = require('./forbiddenLinks.json');

const userViolations = {}; // { userId: count }

module.exports = async function linkScanner(message, client) {
    if (message.author.bot || !message.guild) return;

    const content = message.content.toLowerCase();

    for (const link of forbiddenLinks) {
        if (content.includes(link)) {
            // Rimuove il messaggio
            await message.delete();

            // Inizializza o incrementa le violazioni
            const userId = message.author.id;
            userViolations[userId] = (userViolations[userId] || 0) + 1;

            const violationCount = userViolations[userId];

            // Log nel canale dedicato
            const logChannel = await client.channels.fetch(process.env.LINK_LOG_CHANNEL_ID);
            if (logChannel) {
                logChannel.send(`⚠️ **${message.author.tag}** ha tentato di inviare un link proibito: \`${link}\` (violazioni: ${violationCount})`);
            }

            // Ban dopo 3 violazioni
            if (violationCount >= 3) {
                const member = await message.guild.members.fetch(userId);
                if (member && member.bannable) {
                    await member.ban({ reason: 'Invio ripetuto di link non autorizzati' });
                    logChannel?.send(`🔨 L'utente **${message.author.tag}** è stato **bannato permanentemente** per spam di link vietati.`);
                }
            } else {
                // Avviso all'utente via DM
                try {
                    await message.author.send(`❌ Il link che hai provato a inviare è **vietato** su questo server. Dopo 3 tentativi verrai bannato.`);
                } catch (err) {
                    console.warn(`Impossibile inviare DM a ${message.author.tag}`);
                }
            }

            break; // Blocca su primo match
        }
    }
};
