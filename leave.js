const fs = require('fs');
const path = require('path');
const config = require('./config');

const dbPath = path.join(__dirname, 'database_leave.json');
let leaveDb = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf8')) : {};
const fallbackImg = path.join(__dirname, 'group.jpg');
const thumbImg = path.join(__dirname, 'preview.jpg');

const saveDb = () => fs.writeFileSync(dbPath, JSON.stringify(leaveDb, null, 2));

const toggleLeave = (groupId, state) => {
    leaveDb[groupId] = state === 'on';
    saveDb();
    return leaveDb[groupId];
};

const handleLeave = async (sock, update) => {
    const { id, participants, action } = update;
    if (action !== 'remove' || !leaveDb[id]) return;

    let groupName = "Grup Ini";
    try {
        const groupMetadata = await sock.groupMetadata(id);
        groupName = groupMetadata.subject;
    } catch (err) {}

    for (let item of participants) {
        const num = (typeof item === 'object' && item !== null) ? item.id : String(item);
        const userNumber = num.split('@')[0];

        const leaveText = `> \`[ GOODBYE ]\`\n\nSelamat tinggal @${userNumber}\n\nTelah keluar dari group\n> _${groupName}_`;

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
                title: "🍂 ＳＡＹＯＮＡＲＡ  ＭＥＭＢＥＲ 🍂",
                body: "Terima kasih sudah meramaikan grup ini! 👋",
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
                    caption: leaveText,
                    contextInfo: contextInfo
                });
            } else {
                await sock.sendMessage(id, {
                    text: leaveText,
                    contextInfo: contextInfo
                });
            }
        } catch (sendErr) {
            console.log(`[LEAVE] Gagal ngirim pesan:`, sendErr.message);
        }
    }
};

module.exports = { toggleLeave, handleLeave };