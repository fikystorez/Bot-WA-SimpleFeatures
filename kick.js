const sendKick = async (sock, msg, from, isGroup, isOwner) => {
    if (!isGroup) return;

    try {
        const groupMetadata = await sock.groupMetadata(from);
        const senderId = msg.key.participant || msg.key.remoteJid;
        
        const participant = groupMetadata.participants.find(p => p.id === senderId);
        const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';

        if (!isAdmin && !isOwner) return;

        let target = '';
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.participant;
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

        if (quotedMsg) {
            target = quotedMsg;
        } else if (mentioned && mentioned.length > 0) {
            target = mentioned[0];
        } else {
            return sock.sendMessage(from, { text: "❌ Reply pesan orangnya atau tag nomornya bos!\nContoh: `.kick @user`" }, { quoted: msg });
        }

        const botNumber = sock.user.id.split(':')[0].split('@')[0];
        if (target.includes(botNumber) || target === senderId) {
            return sock.sendMessage(from, { text: "❌ Kagak bisa nge-kick bot atau diri sendiri bos!" }, { quoted: msg });
        }

        const targetNumber = target.split('@')[0];
        const targetData = groupMetadata.participants.find(p => p.id === target || p.id.includes(targetNumber));

        if (targetData && (targetData.admin === 'admin' || targetData.admin === 'superadmin')) {
            return sock.sendMessage(from, { 
                text: "❌ Ditolak! Target adalah sesama Admin. Jangan memicu perang saudara bos! 🛡️" 
            }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: "⏳ _Mengeksekusi target..._" }, { quoted: msg });

        try {
            await sock.groupParticipantsUpdate(from, [target], "remove");
            await sock.sendMessage(from, { text: `✅ Berhasil menendang target dari grup!` });
        } catch (kickErr) {
            sock.sendMessage(from, { 
                text: `❌ Gagal nendang!\nPastikan bot sudah jadi Admin.` 
            }, { quoted: msg });
        }

    } catch (err) {
        console.log(err);
    }
};

module.exports = { sendKick };