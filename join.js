const fs = require('fs');
const path = require('path');
const config = require('./config');

const dbPath = path.join(__dirname, 'database_join.json');
let joinDb = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf8')) : {};
const fallbackImg = path.join(__dirname, 'group.jpg');
const thumbImg = path.join(__dirname, 'preview.jpg');

const saveDb = () => fs.writeFileSync(dbPath, JSON.stringify(joinDb, null, 2));

const toggleJoin = (groupId, state) => {
    joinDb[groupId] = state === 'on';
    saveDb();
    return joinDb[groupId];
};

const handleJoin = async (sock, update) => {
    const { id, participants, action } = update;
    if (action !== 'add' || !joinDb[id]) return;

    let groupName = "Grup Ini";
    let groupDesc = "Tidak ada deskripsi grup.";
    try {
        const groupMetadata = await sock.groupMetadata(id);
        groupName = groupMetadata.subject;
        groupDesc = groupMetadata.desc ? groupMetadata.desc.toString() : groupDesc;
    } catch (err) {}

    for (let item of participants) {
        const num = (typeof item === 'object' && item !== null) ? item.id : String(item);
        const userNumber = num.split('@')[0];

        const welcomeText = `> \`[ WELCOME ]\`\n\nHai @${userNumber}\n\nSelamat datang di group\n> _${groupName}_\n\n\n\nHarap baca dan patuhi peraturan disini ya:\n${groupDesc}`;

        const contextInfo = {
            mentionedJid: [num],
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: config.channelJid,
                newsletterName: config.channelName,
                serverMessageId: 1
            },
            externalAdReply: {
                title: "✨ ＷＥＬＣＯＭＥ  ＮＥＷ  ＭＥＭＢＥＲ ✨",
                body: "Selamat bergabung, semoga betah ya! ☕",
                sourceUrl: config.channelUrl,
                mediaType: 1,
                renderLargerThumbnail: false,
                thumbnail: fs.existsSync(thumbImg) ? fs.readFileSync(thumbImg) : null
            }
        };

        try {
            if (fs.existsSync(fallbackImg)) {
                await sock.sendMessage(id, {
                    image: fs.readFileSync(fallbackImg),
                    caption: welcomeText,
                    contextInfo: contextInfo
                });
            } else {
                await sock.sendMessage(id, {
                    text: welcomeText,
                    contextInfo: contextInfo
                });
            }
        } catch (sendErr) {
            console.log(`[JOIN] Gagal ngirim pesan:`, sendErr.message);
        }
    }
};

module.exports = { toggleJoin, handleJoin };