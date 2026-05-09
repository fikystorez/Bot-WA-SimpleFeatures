<div align="center">

<img src="https://telegra.ph/file/0b32e0a0bb07584f92700.png" alt="Bot Logo" width="150" />

# 🤖 WhatsApp Bot by Digital Fiky Store

> _Bot WhatsApp Multi-Fungsi yang elegan, cepat, dan mudah digunakan untuk manajemen grup serta utilitas harian._

![NodeJS](https://img.shields.io/badge/Node.js-v16.x%20or%20higher-green?style=for-the-badge&logo=node.js)
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

* **Node.js**: Versi `16.x` atau lebih baru.
* **FFmpeg**: Wajib diinstal untuk fitur konversi media (seperti `.tovn`).
* **Git**: Untuk melakukan *clone repository*.
* **Sistem Operasi**: Disarankan menggunakan **Ubuntu 20.04** untuk *deployment* server, karena sangat stabil untuk menahan operasional bot 24/7 dan menjalankan proses *tunneling* tanpa kendala.

---

## 🚀 Cara Instalasi

Ikuti langkah-langkah di bawah ini untuk menjalankan bot:

**1. Clone Repository**
```bash
git clone [https://github.com/UsernameKamu/NamaRepoKamu.git](https://github.com/UsernameKamu/NamaRepoKamu.git)
cd NamaRepoKamu
