<div align="center">

<img src="https://telegra.ph/file/0b32e0a0bb07584f92700.png" alt="Bot Logo" width="150" />

# 🤖 WhatsApp Bot by Digital Fiky Store

> _Bot WhatsApp Multi-Fungsi yang elegan, cepat, dan mudah digunakan untuk manajemen grup serta utilitas harian._

![NodeJS](https://img.shields.io/badge/Node.js-v20.x%20or%20higher-green?style=for-the-badge&logo=node.js)
![Ubuntu](https://img.shields.io/badge/Ubuntu-20.04-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

</div>

---

## 📑 Daftar Isi
- [Tentang Project](#-tentang-project)
- [Daftar Fitur](#-daftar-fitur)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Cara Instalasi](#-cara-instalasi)
- [Kontribusi](#-kontribusi)
- [Credit](#-credit)

---

## 🌟 Tentang Project
Bot ini dikembangkan khusus untuk mempermudah ekosistem grup WhatsApp. Dilengkapi dengan sistem keamanan grup (Auto Welcome/Goodbye & Kick), pengingat waktu sholat yang akurat, hingga utilitas *downloader* super cepat tanpa *watermark*.

---

## ✨ Daftar Fitur

### 👑 Menu Khusus Admin & Owner
> _Akses terbatas untuk menjaga keamanan dan ketertiban grup._

- [x] `.join on/off` — Mengaktifkan/mematikan fitur **Auto Welcome** untuk anggota baru.
- [x] `.leave on/off` — Mengaktifkan/mematikan fitur **Auto Goodbye** untuk anggota yang keluar.
- [x] `.kick` — Mengeluarkan (*kick*) anggota secara paksa dari grup.
- [x] `.hidetag` / `.h` — Melakukan *tag* ke semua anggota grup secara tersembunyi (berguna untuk pengumuman).
- [x] `.setsholat` — Mengatur bot agar otomatis mengirimkan notifikasi Adzan di grup.
- [x] `.swgc` — Mengirim/meneruskan media ke Status WhatsApp grup dalam resolusi **HD**.
- [x] `.ceksaluran` — Melihat JID (*Jabber ID*) dari sebuah Saluran WhatsApp.

### 🛠️ Fitur Umum
> _Dapat digunakan oleh seluruh anggota grup._

- [x] `.tt` / `.tiktok` — Mengunduh video/audio TikTok tanpa *watermark* (kualitas terbaik).
- [x] `.tovn` — Mengonversi media (audio/video) menjadi format Voice Note (VN) WhatsApp.
- [x] `.ceksholat` — Menampilkan jadwal sholat harian berdasarkan wilayah.

---

## ⚙️ Persyaratan Sistem

Pastikan *environment* server atau perangkat kamu sudah memenuhi syarat berikut sebelum melakukan instalasi:

* **Node.js**: **Wajib versi `20.x` atau lebih baru.** *(Library Baileys terbaru tidak mendukung Node.js 18 ke bawah).*
* **FFmpeg**: Wajib diinstal untuk fitur konversi media (seperti `.tovn`).
* **Git**: Untuk melakukan *clone repository*.
* **Sistem Operasi**: Disarankan menggunakan **Ubuntu 20.04** untuk *deployment* server, karena sangat stabil untuk menahan operasional bot 24/7 dan menjalankan proses 

> **💡 Catatan untuk Pengguna Ubuntu:**
> Jika versi Node.js kamu masih di bawah 20, silakan *upgrade* terlebih dahulu dengan menjalankan perintah ini di terminal:
> ```bash
> curl -fsSL [https://deb.nodesource.com/setup_20.x](https://deb.nodesource.com/setup_20.x) | sudo -E bash -
> sudo apt-get install -y nodejs
> ```

---

## 🚀 Cara Instalasi

Ikuti langkah-langkah di bawah ini untuk menginstal dan menjalankan bot dari repository resmi:

**1. Clone Repository**
```bash
git clone [https://github.com/fikystorez/Bot-WA-SimpleFeatures.git](https://github.com/fikystorez/Bot-WA-SimpleFeatures.git)
cd Bot-WA-SimpleFeatures
```

**2. Install Dependencies**
Pastikan kamu berada di dalam folder `Bot-WA-SimpleFeatures`, lalu jalankan:
```bash
npm install
```

**3. Konfigurasi Bot**
Buka file konfigurasi yang tersedia di dalam folder (biasanya `config.js`, `settings.json`, atau `.env`) lalu sesuaikan pengaturan seperti nomor Owner:
```javascript
// Contoh jika pengaturannya ada di dalam file JS/JSON
global.owner = ['628xxxxxxxxxx'] // Ganti dengan nomor WhatsApp kamu
global.botName = 'Bot DFS'
```

**4. Jalankan Bot**
Setelah semua proses selesai, jalankan bot dengan perintah:
```bash
npm start
```
> 💡 **Tip:** Setelah perintah dijalankan, akan muncul QR Code di terminal. Buka aplikasi WhatsApp di HP kamu > Perangkat Taut > Tautkan Perangkat > Scan QR Code tersebut.

---

## 🤝 Kontribusi
Punya ide fitur baru atau menemukan *bug*? Jangan ragu untuk melakukan *Pull Request* atau membuka *Issue* di *repository* ini. Segala bentuk kontribusi sangat dihargai!

---

## 📜 Credit
Dikembangkan dan dikelola dengan ❤️ oleh **Digital Fiky Store**. 
Jika kamu suka dengan project ini, jangan lupa berikan ⭐ (Star) pada *repository* ini!

