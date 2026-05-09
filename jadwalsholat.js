const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const dbPath = './database_sholat.json';

// Cek & Load Database
let groupsDb = {};
if (fs.existsSync(dbPath)) {
    groupsDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveDb() {
    fs.writeFileSync(dbPath, JSON.stringify(groupsDb, null, 2));
}

let cdn = 'https://c.termai.cc';
const audioFiles = {
    adzan: 'adzan.'.repeat(4).split('.').map((a, i) => cdn + '/audio/' + a + (i + 1) + '.mp3').slice(0, -1),
    adzan_subuh: 'adzan_subuh.'.repeat(4).split('.').map((a, i) => cdn + '/audio/' + a + (i + 1) + '.mp3').slice(0, -1),
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

class JadwalSholat {
    constructor() {
        this.groups = groupsDb;
        this.url = 'https://www.kompas.com/jadwal-sholat/';
        this.daerahCache = null;
    }

    async getDaerah() {
        if (!this.daerahCache) {
            try {
                let res = await axios.get(cdn + '/json/daerah.json');
                this.daerahCache = res.data;
            } catch (e) {
                console.log("Gagal ambil daftar daerah", e);
                return {};
            }
        }
        return this.daerahCache;
    }

    async init(id, v = 'kab-bungo', opts = { ramadhan: false }) {
        try {
            const daerahList = await this.getDaerah();
            const allDaerah = Object.values(daerahList).flat();
            
            if (!allDaerah.includes(v)) {
                return { status: false, msg: `Daerah "${v}" tidak ada dalam daftar!`, list: allDaerah };
            }

            let html;
            try {
                // Fetch dari Kompas
                let res = await axios.get(this.url + v);
                html = res.data;
            } catch (e) {
                return { status: false, msg: `Gagal scrape jadwal untuk ${v}` };
            }

            const $ = cheerio.load(html);
            let list = [];

            $(`#jadwal-${opts.ramadhan ? 'ramadhan' : 'sholat'} table tbody tr`).each((index, element) => {
                let row = $(element).find('td').map((_, td) => $(td).text().trim()).get();
                if (row.length > 0) {
                    if (!opts.ramadhan) {
                        const dateMatch = row[0].match(/\d{2}\/\d{2}/);
                        const dateOnly = dateMatch ? dateMatch[0].split('/')[0] : '';
                        row = [dateOnly, dateMatch ? dateMatch[0] : '', ...row.slice(1)];
                    }
                    list.push(row);
                }
            });

            list = list.map((row) => {
                return Object.fromEntries(
                    ['hari', 'tanggal', ...(opts.ramadhan ? ['imsak'] : []), 'subuh', 'terbit', 'dzuhur', 'ashar', 'magrib', 'isya']
                    .map((key, index) => [key, row[index]])
                );
            });

            let timeZone = daerahList.wib.includes(v) ? 'Asia/Jakarta' : daerahList.wita?.includes(v) ? 'Asia/Makassar' : 'Asia/Jayapura';

            if (id === 'no') return { status: true, data: list, timeZone };

            // Simpan ke database memory
            this.groups[id] = { v, jadwal: list, timeZone, ...opts };
            saveDb(); // Simpan permanen ke file

            return { status: true, data: list, db: this.groups[id] };
        } catch (e) {
            console.error('Error init jadwalsholat', e);
            return { status: false, msg: 'Internal Error' };
        }
    }

    async now(id) {
        if (!id || !(id in this.groups)) return { status: false, msg: 'Grup belum di-setup' };

        let { timeZone, v, ramadhan } = this.groups[id];
        const daerahList = await this.getDaerah();

        if (!timeZone) {
            timeZone = this.groups[id].timeZone = daerahList.wib.includes(v) ? 'Asia/Jakarta' : daerahList.wita?.includes(v) ? 'Asia/Makassar' : 'Asia/Jayapura';
            saveDb();
        }

        const formatter = new Intl.DateTimeFormat('id-ID', {
            timeZone, hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
        });

        const parts = formatter.formatToParts(new Date());
        const h = String(parts.find((p) => p.type === 'hour').value).padStart(2, '0');
        const min = String(parts.find((p) => p.type === 'minute').value).padStart(2, '0');
        const d = String(parseInt(parts.find((p) => p.type === 'day').value, 10)).padStart(2, '0');
        const m = String(parseInt(parts.find((p) => p.type === 'month').value, 10)).padStart(2, '0');

        let dm = `${d}/${m}`;

        // Update list jika beda bulan
        if (this.groups[id].jadwal?.[0]?.tanggal?.split('/')?.[1] !== m) {
            let refresh = await this.init(id, v);
            if(refresh.status) this.groups[id].jadwal = refresh.data;
        }

        this.groups[id].today = this.groups[id].jadwal.find((a) => a.tanggal == dm);

        if (!this.groups[id].today) return { status: false, msg: "Jadwal hari ini tidak ditemukan" };

        let except = ['hari', 'tanggal', 'terbit', 'notice', 'imsak'];
        if (ramadhan) except = except.filter((a) => a !== 'imsak');
        
        let ktoday = Object.keys(this.groups[id].today).filter((a) => !except.some((b) => a.includes(b)));

        // Cek apakah sekarang waktunya sholat
        let waktu = ktoday.find((a) => {
            let [sh, sm] = this.groups[id].today[a].split(':').map(Number);
            // Toleransi delay max 5 menit
            return sh == h && parseInt(min) - sm <= 5 && parseInt(min) >= sm;
        });

        let hasNotice = Boolean(this.groups[id].today['notice-' + waktu]);
        if (waktu && !hasNotice) {
            this.groups[id].today['notice-' + waktu] = true;
            saveDb(); // Save status notice biar gk spam
        }

        return {
            status: true,
            data: {
                today: this.groups[id].today,
                now: waktu || false,
                adzan: waktu == 'subuh' ? getRandom(audioFiles.adzan_subuh) : waktu ? getRandom(audioFiles.adzan) : null,
                hasNotice
            }
        };
    }
}

module.exports = new JadwalSholat();