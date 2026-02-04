const axios = require('axios');
const fs = require('fs');
const path = require('path');

let accessToken = '';
const cacheFile = path.join(__dirname, 'twitchLiveCache.json');

// Funzione per caricare la cache da file
function loadCache() {
    try {
        const data = fs.readFileSync(cacheFile, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

// Funzione per salvare la cache su file
function saveCache(liveList) {
    fs.writeFileSync(cacheFile, JSON.stringify(liveList, null, 2));
}

// Recupera token da Twitch
async function getAccessToken() {
    const res = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    });
    accessToken = res.data.access_token;
}

// Controlla lo stato live e invia embed se necessario
async function checkLiveStatus(client) {
    if (!accessToken) await getAccessToken();

    const streamers = process.env.TWITCH_STREAMERS.split(',');
    const channelId = process.env.TWITCH_DISCORD_CHANNEL;
    const discordChannel = await client.channels.fetch(channelId);
    let activeStreams = loadCache();

    for (const streamer of streamers) {
        try {
            const res = await axios.get(`https://api.twitch.tv/helix/streams`, {
                headers: {
                    'Client-ID': process.env.TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${accessToken}`
                },
                params: { user_login: streamer }
            });

            const streamData = res.data.data[0];

            if (streamData && !activeStreams.includes(streamer)) {
                // È andato in live ora
                activeStreams.push(streamer);
                saveCache(activeStreams);

                const embed = {
                    title: `${streamData.user_name} è in diretta!`,
                    url: `https://twitch.tv/${streamData.user_name}`,
                    description: streamData.title,
                    color: 6570404,
                    image: {
                        url: streamData.thumbnail_url
                            .replace('{width}', '1280')
                            .replace('{height}', '720')
                    },
                    footer: { text: '🔴 LIVE su Twitch' },
                    timestamp: new Date()
                };

                await discordChannel.send({ embeds: [embed] });
                console.log(`🔔 Notifica live inviata per ${streamer}`);
            }

            if (!streamData && activeStreams.includes(streamer)) {
                // Non è più live
                activeStreams = activeStreams.filter(s => s !== streamer);
                saveCache(activeStreams);
                console.log(`📴 ${streamer} è andato offline.`);
            }

        } catch (err) {
            console.warn(`⚠️ Errore nel controllo di ${streamer}:`, err.response?.data || err.message);
        }
    }
}

module.exports = { checkLiveStatus };
