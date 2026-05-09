const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay, downloadContentFromMessage, generateWAMessageFromContent, prepareWAMessageMedia, proto, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const readline = require("readline");
const fs = require("fs");
const { exec } = require("child_process");
const chalk = require("chalk");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");
const sholatInfo = require("./jadwalsholat");
const joinHandler = require("./join");
const leaveHandler = require("./leave");
const menuHandler = require('./menu');
const kickHandler = require('./kick');
const tiktokHandler = require('./tiktok');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);
process.on('uncaughtException', (err) => {});

let tempGabung = {};
let tempMani = {};
let modePrivate = false;

async function startBot() {
    console.clear();
    console.log(chalk.cyan.bold(`
╔═══════════════════════════════════════════════╗
║               Fiky Store            ║
║         TIKTOK TIKWM & STECU VN READY         ║
╚═══════════════════════════════════════════════╝
    `));

    const { state, saveCreds } = await useMultiFileAuthState('session_auth');
    const { version } = await fetchLatestBaileysVersion();

    let phoneNumber = "";
    if (!state.creds.registered) {
        phoneNumber = await question(chalk.bgWhite.black(' Masukkan Nomor WhatsApp (Contoh: 628123456xxx): '));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    }

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!sock.authState.creds.registered && phoneNumber) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log(chalk.bold.white(`\nKODE PAIRING ANDA: `) + chalk.bgGreen.black(` ${code} `) + `\n`);
            } catch (err) {}
        }, 3000);
    }

    setInterval(async () => {
        for (const groupId in sholatInfo.groups) {
            let res = await sholatInfo.now(groupId);
            
            if (res.status && res.data.now && !res.data.hasNotice) {
                const waktu = res.data.now.toLowerCase();
                const daerah = sholatInfo.groups[groupId].v;
                let groupName = "Grup Ini";

                try {
                    const metadata = await sock.groupMetadata(groupId);
                    groupName = metadata.subject;
                } catch (err) {}

                const teksSholat = `*Hai seluruh umat muslim yang berada di group \`${groupName}\`!*\n\nWaktu sholat *${waktu}* di daerah ${daerah} sudah masuk! Buat semua yang ada di daerah ${daerah}, yuk segera tunaikan sholat!`;

                try {
                    await sock.sendMessage(groupId, { text: teksSholat });
                    
                    if (res.data.adzan) {
                        const time = Date.now();
                        const inputPath = `./temp_adzan_${time}.mp3`;
                        const outputPath = `./out_adzan_${time}.opus`;

                        const response = await axios({
                            method: 'GET',
                            url: res.data.adzan,
                            responseType: 'stream'
                        });

                        const writer = fs.createWriteStream(inputPath);
                        response.data.pipe(writer);

                        writer.on('finish', () => {
                            const cmd = `ffmpeg -i "${inputPath}" -vn -c:a libopus -b:a 32k -ar 48000 -ac 1 -map_metadata -1 "${outputPath}"`;
                            exec(cmd, async (err) => {
                                if (!err) {
                                    try {
                                        await sock.sendMessage(groupId, {
                                            audio: { url: outputPath },
                                            mimetype: 'audio/ogg; codecs=opus',
                                            ptt: true
                                        });
                                    } catch (sendErr) {}
                                }
                                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                            });
                        });

                        writer.on('error', () => {
                            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                        });
                    }
                } catch (err) {}
            }
        }
    }, 60000);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log(chalk.green("✅ [CONN] Bot Berhasil Terhubung!"));

            const pendingPath = './pending_sw.json';
            if (fs.existsSync(pendingPath)) {
                try {
                    const pending = JSON.parse(fs.readFileSync(pendingPath));
                    
                    setTimeout(async () => {
                        if (fs.existsSync(pending.file)) {
                            try {
                                let viewers = [sock.user.id.split(':')[0] + "@s.whatsapp.net"];
                                if (fs.existsSync('./contacts.vcf')) {
                                    const vcf = fs.readFileSync('./contacts.vcf', 'utf8');
                                    vcf.split('\n').forEach(line => {
                                        if (line.includes('TEL;')) {
                                            let num = line.split(':')[1].replace(/[^0-9]/g, '');
                                            if (num.startsWith('08')) num = '62' + num.slice(1);
                                            if (num.length > 9) viewers.push(num + '@s.whatsapp.net');
                                        }
                                    });
                                }
                                const uniqueViewers = [...new Set(viewers)];

                                const media = await prepareWAMessageMedia({ 
                                    video: { url: pending.file }, 
                                    caption: pending.caption 
                                }, { upload: sock.waUploadToServer });

                                let messageContent = { videoMessage: media.videoMessage };

                                messageContent.videoMessage.annotations = [{
                                    embeddedContent: {
                                        embeddedMusic: {
                                            musicContentMediaId: "1156787372946766",
                                            songId: "470425165754838",
                                            author: "FIKYSTORE",
                                            title: "©𝐒𝐭𝐨𝐫𝐲 𝐇𝐝",
                                            artistAttribution: "Mas Fiky",
                                            externalAttributionUrl: "https://www.tiktok.com/@penggemar1112?_r=1&_t=ZS-931sj0QLjsL_t",
                                            isExplicit: false
                                        }
                                    },
                                    embeddedAction: true
                                }];

                                const msgGen = await generateWAMessageFromContent("status@broadcast", messageContent, { userJid: sock.user.id });

                                await sock.relayMessage("status@broadcast", msgGen.message, { 
                                    messageId: msgGen.key.id, 
                                    statusJidList: uniqueViewers 
                                });

                                if (fs.existsSync(pendingPath)) fs.unlinkSync(pendingPath);
                                if (fs.existsSync(pending.file)) fs.unlinkSync(pending.file);

                            } catch (err) {}
                        }
                    }, 7000);
                } catch (e) {}
            }
        }
    });

    sock.ev.on("creds.update", saveCreds);
    
    sock.ev.on('group-participants.update', async (update) => {
        await joinHandler.handleJoin(sock, update);
        await leaveHandler.handleLeave(sock, update);
    });

    sock.ev.on("messages.upsert", async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message) return;

            const from = msg.key.remoteJid;
            const isOwner = msg.key.fromMe;
            const pushName = msg.pushName || "User";
            const isGroup = from.endsWith('@g.us');
            
            const body = msg.message.conversation || 
                         msg.message.extendedTextMessage?.text || 
                         msg.message.imageMessage?.caption || 
                         msg.message.videoMessage?.caption || "";
            
            const command = body.trim().split(' ')[0].toLowerCase();
            const args = body.trim().split(' ').slice(1);
            const text = args.join(' ');

            const reply = (teks) => {
                sock.sendMessage(from, { text: teks }, { quoted: msg });
            };
            
            if (modePrivate && !isOwner) return;

            if (command) {
                const time = new Date().toLocaleTimeString('id-ID');
                console.log(
                    chalk.cyanBright('[CMD]'), 
                    chalk.yellowBright(time), 
                    chalk.greenBright(command), 
                    chalk.white('from'), 
                    chalk.magentaBright(pushName), 
                    chalk.blueBright(isGroup ? 'Group' : 'Private')
                );
            }

            if (from === 'status@broadcast' || isGroup) {
                const statusMsg = msg.message?.videoMessage || msg.message?.imageMessage || 
                                  msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
                                  msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

                if (statusMsg?.annotations) {
                    const musicData = statusMsg.annotations[0]?.embeddedContent?.embeddedMusic;
                    if (musicData && !msg.key.fromMe) {
                        sock.sendMessage(sock.user.id, { 
                            text: `🎵 *METADATA MUSIK TERDETEKSI*\n\n` +
                                  `▪️ *ID Media:* \`${musicData.musicContentMediaId}\`\n` +
                                  `▪️ *ID Lagu:* \`${musicData.songId}\`\n` +
                                  `▪️ *Artis:* ${musicData.author}\n` +
                                  `▪️ *Link:* ${musicData.externalAttributionUrl}\n\n` +
                                  `_Salin ID di atas untuk dipasang di case swgc3!_` 
                        });
                    }
                }
            }

            switch (command) {
                case 'tovn':
                case '.tovn': {
                    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage || msg.message.audioMessage || msg.message.videoMessage;
                    if (!quoted) return reply("❌ Reply audionya dulu bos!");

                    const mime = Object.keys(quoted)[0];
                    await reply(`⏳ **REPAIRING VN SYSTEM...**\n_Memperbaiki metadata & stream..._`);

                    try {
                        const stream = await downloadContentFromMessage(quoted[mime], mime.split('Message')[0]);
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

                        const time = Date.now();
                        const inputPath = `./in_${time}`;
                        const outputPath = `./out_${time}.opus`;
                        fs.writeFileSync(inputPath, buffer);

                        const cmd = `ffmpeg -i "${inputPath}" -vn -c:a libopus -b:a 32k -ar 48000 -ac 1 -map_metadata -1 "${outputPath}"`;

                        exec(cmd, async (err) => {
                            if (err) return reply("❌ Gagal convert.");

                            await sock.sendMessage(from, {
                                audio: { url: outputPath },
                                mimetype: 'audio/ogg; codecs=opus',
                                ptt: true,
                                seconds: 60
                            }, { quoted: msg });

                            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                        });
                    } catch (e) {
                        reply("❌ Error: " + e.message);
                    }
                    break;
                }
                
                
                
                
                case 'menu':
                case '.menu': {
                    await menuHandler.sendMenu(sock, msg, from, isGroup, isOwner);
                    break;
                }
                
                
                
                
                case 'hidetag':
                case 'h':
                case '.hidetag':
                case '.h': {
                    if (!isGroup) return reply("❌ Khusus di dalam grup bos!");
                    
                    const groupMetadata = await sock.groupMetadata(from);
                    const senderId = msg.key.participant || msg.key.remoteJid;
                    const participant = groupMetadata.participants.find(p => p.id === senderId);
                    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                    
                    if (!isAdmin && !isOwner) return reply("❌ Command ini khusus Admin Grup dan Owner Bot!");

                    const participants = groupMetadata.participants.map(p => p.id);
                    const pesan = text ? text : "Panggilan untuk seluruh member grup!";

                    sock.sendMessage(from, { text: pesan, mentions: participants });
                    break;
                }
                
                
case 'swgc':
case '.swgc': {
    let isAdmin = false;
    if (isGroup) {
        const groupMetadata = await sock.groupMetadata(from);
        const senderId = msg.key.participant || msg.key.remoteJid;
        const participant = groupMetadata.participants.find(p => p.id === senderId);
        isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
    }
    
    if (!isAdmin && !isOwner) return reply("❌ Command ini khusus Admin Grup dan Owner Bot!");
    
    const githubLink = "https://github.com/devoloperPY";
    const allGroups = await sock.groupFetchAllParticipating();
    const groupsList = Object.values(allGroups);
    
    let textRaw = args.join(" ");
    let targetJid = from;
    let lastArg = args[args.length - 1];

    if (!isGroup && args.length > 0 && !isNaN(lastArg)) {
        const idx = parseInt(lastArg) - 1;
        if (groupsList[idx]) {
            targetJid = groupsList[idx].id;
            textRaw = args.slice(0, -1).join(" ");
        }
    } else if (!isGroup && args.length === 0) {
        let listTxt = `📋 **DAFTAR GRUP**\n\n`;
        groupsList.forEach((g, i) => { listTxt += `${i + 1}. ${g.subject}\n`; });
        return reply(listTxt);
    }

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || 
                   msg.message?.videoMessage || 
                   msg.message?.imageMessage || 
                   msg.message?.audioMessage || 
                   msg.message?.documentMessage;
                   
    let inputPath = "";
    let captionText = "© 𝐒𝐓𝐀𝐓𝐔𝐒 𝐇𝐃";
    let mediaCategory = 'image';

    if (quoted) {
        captionText = textRaw || "© 𝐒𝐓𝐀𝐓𝐔𝐒 𝐇𝐃";
        const type = Object.keys(quoted).find(k => k.includes('Message'));
        if (!type) return reply("❌ Media tidak dikenali!");
        
        const msgContent = quoted[type];
        const mime = msgContent.mimetype || '';

        let ext = 'jpg';
        if (type === 'videoMessage' || (type === 'documentMessage' && mime.includes('video'))) {
            mediaCategory = 'video';
            ext = 'mp4';
        } else if (type === 'audioMessage' || (type === 'documentMessage' && mime.includes('audio'))) {
            mediaCategory = 'audio';
            ext = 'mp3';
        } else if (type === 'imageMessage' || (type === 'documentMessage' && mime.includes('image'))) {
            mediaCategory = 'image';
            ext = 'jpg';
        } else {
            return reply("❌ Format tidak didukung! Pastikan file berupa gambar, video, atau audio (mp3/mp4).");
        }

        await reply(`⏳ _Downloading & Processing ${mediaCategory.toUpperCase()}..._`);
        const dlType = type.replace('Message', '');
        const stream = await downloadContentFromMessage(msgContent, dlType);
        inputPath = `./temp_swgc7_${Date.now()}.${ext}`;
        const writeStream = fs.createWriteStream(inputPath);
        await new Promise((resolve) => { stream.pipe(writeStream); stream.on('end', resolve); });
    } else if (textRaw.length > 0) {
        captionText = "© 𝐒𝐓𝐀𝐓𝐔𝐒 𝐇𝐃";
        mediaCategory = 'image';
        inputPath = `./swgc_txt_${Date.now()}.jpg`;
        const fontPath = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
        
        const wrapText = (text, max) => text.replace(new RegExp(`(?![^\\n]{1,${max}}$)([^\\n]{1,${max}})\\s`, 'g'), '$1\n');
        fs.writeFileSync('./text.txt', wrapText(textRaw.toUpperCase(), 22));
        
        await reply("⏳ _Creating Status Canvas..._");
        const cmdCanvas = `ffmpeg -f lavfi -i color=c=0x1E1E2E:s=1080x1080 -vf "drawtext=fontfile='${fontPath}':textfile='./text.txt':fontcolor=white:fontsize=75:x=(w-text_w)/2:y=(h-text_h)/2:shadowcolor=black:shadowx=3:shadowy=3" -frames:v 1 "${inputPath}"`;
        await new Promise((resolve, reject) => exec(cmdCanvas, (err) => err ? reject(err) : resolve()));
        fs.unlinkSync('./text.txt');
    } else {
        return reply("❌ Masukkan teks atau reply media!");
    }

    try {
        const outputPath = `./final_swgc7_${Date.now()}.${mediaCategory === 'audio' ? 'opus' : mediaCategory === 'video' ? 'mp4' : 'jpg'}`;
        let cmd = '';

        if (mediaCategory === 'video') {
            cmd = `ffmpeg -y -i "${inputPath}" -c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k "${outputPath}"`;
        } else if (mediaCategory === 'image') {
            cmd = `ffmpeg -y -i "${inputPath}" -vf "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080" -q:v 1 "${outputPath}"`;
        } else if (mediaCategory === 'audio') {
            cmd = `ffmpeg -y -i "${inputPath}" -vn -c:a libopus -b:a 32k -ar 48000 -ac 1 -map_metadata -1 "${outputPath}"`;
        }
        
        await new Promise((resolve, reject) => exec(cmd, (err) => err ? reject(err) : resolve()));

        let mediaOpts = { [mediaCategory]: { url: outputPath } };
        
        if (mediaCategory !== 'audio') {
            mediaOpts.caption = captionText;
        } else {
            mediaOpts.mimetype = 'audio/ogg; codecs=opus';
            mediaOpts.ptt = true;
            mediaOpts.seconds = 60;
        }

        const mediaUpload = await prepareWAMessageMedia(mediaOpts, { upload: sock.waUploadToServer });
        
        let muani = { [`${mediaCategory}Message`]: mediaUpload[`${mediaCategory}Message`] };
        
        if (mediaCategory !== 'audio') {
            muani[`${mediaCategory}Message`].annotations = [{
                embeddedContent: {
                    embeddedMusic: {
                        musicContentMediaId: "701656846359198", songId: "857793070040564",
                        author: "Mas Fiky", title: "Group Blast HD",
                        artistAttribution: "Visit My GitHub", externalAttributionUrl: githubLink, isExplicit: false
                    }
                }, embeddedAction: true 
            }];
        } else {
            muani[`${mediaCategory}Message`].backgroundArgb = 4281350033;
        }

        const waMsg = await generateWAMessageFromContent(targetJid, { groupStatusMessageV2: { message: muani } }, { userJid: sock.user.id, quoted: msg });
        await sock.relayMessage(targetJid, waMsg.message, { messageId: waMsg.key.id });

        reply(`✅ **SUKSES UPLOAD SWGC KE:** ${targetJid}`);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch (e) { 
        reply("❌ Gagal: " + e.message); 
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    }
    break;
}

case 'join':
                case '.join': {
                    if (!isGroup) return reply("❌ Khusus di dalam grup bos!");
                    
                    const groupMetadata = await sock.groupMetadata(from);
                    const senderId = msg.key.participant || msg.key.remoteJid;
                    const participant = groupMetadata.participants.find(p => p.id === senderId);
                    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                    
                    if (!isAdmin && !isOwner) return reply("❌ Command ini khusus Admin Grup dan Owner Bot!");

                    if (args[0] === 'on') {
                        joinHandler.toggleJoin(from, 'on');
                        reply("✅ Fitur Welcome diaktifkan di grup ini!");
                    } else if (args[0] === 'off') {
                        joinHandler.toggleJoin(from, 'off');
                        reply("✅ Fitur Welcome dimatikan di grup ini!");
                    } else {
                        reply("❌ Format salah!\nKetik: `.join on` atau `.join off`");
                    }
                    break;
                }

                case 'leave':
                case '.leave': {
                    if (!isGroup) return reply("❌ Khusus di dalam grup bos!");
                    
                    const groupMetadata = await sock.groupMetadata(from);
                    const senderId = msg.key.participant || msg.key.remoteJid;
                    const participant = groupMetadata.participants.find(p => p.id === senderId);
                    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                    
                    if (!isAdmin && !isOwner) return reply("❌ Command ini khusus Admin Grup dan Owner Bot!");

                    if (args[0] === 'on') {
                        leaveHandler.toggleLeave(from, 'on');
                        reply("✅ Fitur Leave diaktifkan di grup ini!");
                    } else if (args[0] === 'off') {
                        leaveHandler.toggleLeave(from, 'off');
                        reply("✅ Fitur Leave dimatikan di grup ini!");
                    } else {
                        reply("❌ Format salah!\nKetik: `.leave on` atau `.leave off`");
                    }
                    break;
                }




case 'cekch':
                case '.ceksaluran': {
                    const code = text.split('channel/')[1];
                    if (!code) return reply("❌ Format salah!\nContoh: `.ceksaluran https://whatsapp.com/channel/0029VbBZ9AmJ3jupObG7To0m`");
                    
                    try {
                        reply("⏳ _Mencari data saluran..._");
                        const data = await sock.newsletterMetadata("invite", code);
                        reply(`✅ **DATA SALURAN DITEMUKAN**\n\n📌 *Nama:* ${data.name}\n🔑 *JID:* ${data.id}\n\n_Silakan copas JID di atas ke dalam config.js lu bos!_`);
                    } catch (e) {
                        reply("❌ Gagal mengambil data: " + e.message);
                    }
                    break;
                }




                
                
                case 'kick':
                case '.kick': {
                    await kickHandler.sendKick(sock, msg, from, isGroup, isOwner);
                    break;
                }
                
                
                case 'tt':
                case '.tt':
                case '.tiktok':
                case 'ttdl': {
                    await tiktokHandler.handleTikTok(sock, msg, from, text, reply, command);
                    break;
                }
                
                
                
                
                






                case 'setsholat':
                case '.setsholat': {
                    if (!isGroup) return reply("❌ Khusus di dalam grup bos!");
                    
                    const groupMetadata = await sock.groupMetadata(from);
                    const senderId = msg.key.participant || msg.key.remoteJid;
                    const participant = groupMetadata.participants.find(p => p.id === senderId);
                    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                    
                    if (!isAdmin && !isOwner) return reply("❌ Command ini khusus Admin Grup dan Owner Bot!");

                    if (!text) return reply("❌ Masukkan nama daerah!\nContoh: `.setsholat kota-bandung`");

                    let daerah = text.toLowerCase().replace(/ /g, '-');
                    await reply("⏳ Sedang mengatur database jadwal sholat...");

                    let setJadwal = await sholatInfo.init(from, daerah);
                    
                    if (!setJadwal.status) {
                        return reply(`❌ Gagal: ${setJadwal.msg}\n\nCek list daerah yang valid di website kompas jadwal sholat.`);
                    }

                    reply(`✅ Berhasil mengaktifkan Auto-Adzan untuk daerah *${daerah}* di grup ini!\nBot akan otomatis mengirimkan notifikasi dan VN saat waktu sholat tiba.`);
                    break;
                }

                case 'ceksholat':
                case '.ceksholat': {
                    if (!sholatInfo.groups[from]) return reply("❌ Grup ini belum mengatur jadwal sholat. Ketik `.setsholat <daerah>`");
                    
                    let res = await sholatInfo.now(from);
                    if (!res.status) return reply("❌ Terjadi kesalahan saat mengambil jadwal.");
                    
                    let t = res.data.today;
                    reply(`🕌 *JADWAL SHOLAT HARI INI*\nWilayah: *${sholatInfo.groups[from].v}*\n\nSubuh: ${t.subuh}\nDzuhur: ${t.dzuhur}\nAshar: ${t.ashar}\nMaghrib: ${t.magrib}\nIsya: ${t.isya}`);
                    break;
                }
            }

        } catch (e) {}
    });
}

startBot();