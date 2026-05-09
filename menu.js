const fs = require('fs');
const path = require('path');
const config = require('./config');

const menuImg = path.join(__dirname, 'group.jpg'); 
const thumbImg = path.join(__dirname, 'preview.jpg');

const sendMenu = async (sock, msg, from, isGroup, isOwner) => {
    let isAdmin = false;
    if (isGroup) {
        try {
            const groupMetadata = await sock.groupMetadata(from);
            const senderId = msg.key.participant || msg.key.remoteJid;
            const participant = groupMetadata.participants.find(p => p.id === senderId);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (err) {}
    }

    if (!isAdmin && !isOwner) return;

    const pushName = msg.pushName || "Bosku";
    const sender = msg.key.participant || msg.key.remoteJid;

    const menuText = `> \`[ COMMAND MENU ]\`\n\n` +
                     `Hai *${pushName}*! 👋\n` +
                     `Berikut adalah daftar perintah yang tersedia:\n\n` +
                     `> _👑 Khusus Admin & Owner_\n` +
                     `➭ \`.join on/off\` - Auto Welcome\n` +
                     `➭ \`.leave on/off\` - Auto Goodbye\n` +
                     `➭ \`.kick\` - Keluarkan member\n` +
                     `➭ \`.hidetag\` / \`.h\` - Tag semua member\n` +
                     `➭ \`.setsholat\` - Set Auto-Adzan\n` +
                     `➭ \`.swgc\` - Status HD ke Grup\n` +
                     `➭ \`.ceksaluran\` - Cek JID Saluran\n\n` +
                     `> _🛠️ Fitur Umum_\n` +
                     `➭ \`.tt\` / \`.tiktok\` - TikTok Downloader\n` +
                     `➭ \`.tovn\` - Ubah media jadi VN\n` +
                     `➭ \`.ceksholat\` - Cek jadwal sholat\n\n` +
                     `_digital.myfiky.store_`;

    const contextInfo = {
        mentionedJid: [sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: config.channelJid,
            newsletterName: config.channelName,
            serverMessageId: 1
        },
        externalAdReply: {
            title: "🚀 FIKY STORE BOT",
            body: "Klik di sini untuk info & update bot!",
            sourceUrl: config.channelUrl,
            mediaType: 1,
            renderLargerThumbnail: false,
            thumbnail: fs.existsSync(thumbImg) ? fs.readFileSync(thumbImg) : null
        }
    };

    try {
        if (fs.existsSync(menuImg)) {
            await sock.sendMessage(from, {
                image: fs.readFileSync(menuImg),
                caption: menuText,
                contextInfo: contextInfo
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, {
                text: menuText,
                contextInfo: contextInfo
            }, { quoted: msg });
        }
    } catch (err) {}
};

module.exports = { sendMenu };