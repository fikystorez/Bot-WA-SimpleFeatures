const axios = require('axios');

const handleTikTok = async (sock, msg, from, text, reply, command) => {
    if (!text) return reply(`Mana link TikTok-nya bos? Contoh: ${command} https://vm.tiktok.com/xxxx`);
    if (!text.includes('tiktok.com')) return reply(`Link tidak valid bos.`);

    await reply('⏳ Sedang mendownload data TikTok... (No Watermark)');

    try {
        const response = await axios.post('https://www.tikwm.com/api/', {
            url: text
        });

        const data = response.data.data;
        if (!data) throw new Error('Video tidak ditemukan / Private.');

        let uploadDate = "Tidak diketahui";
        if (data.create_time) {
            const dateObj = new Date(data.create_time * 1000);
            uploadDate = dateObj.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        }

        if (data.images && data.images.length > 0) {
            await reply(`📸 Terdeteksi ${data.images.length} gambar slide. Mengirim satu per satu...`);
            
            for (let img of data.images) {
                await sock.sendMessage(from, { 
                    image: { url: img }, 
                    caption: '' 
                }, { quoted: msg });
            }
        } else {
            let caption = `*TIKTOK NO WATERMARK*\n\n`;
            caption += `👤 *Author:* ${data.author.nickname}\n`;
            caption += `❤️ *Likes:* ${data.digg_count}\n`;
            caption += `📅 *Diunggah:* ${uploadDate}\n`;
            caption += `💬 *Caption:* ${data.title}\n`;

            await sock.sendMessage(from, { 
                video: { url: data.play }, 
                caption: caption 
            }, { quoted: msg });
        }

        if (data.music) {
            await sock.sendMessage(from, { 
                audio: { url: data.music }, 
                mimetype: 'audio/mpeg', 
                ptt: false, 
                fileName: `tiktok_music.mp3`
            }, { quoted: msg });
        }

    } catch (e) {
        reply('❌ Gagal download bos. Mungkin link private atau API lagi down.');
    }
};

module.exports = { handleTikTok };