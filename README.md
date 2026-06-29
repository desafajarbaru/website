# Website Desa Fajar Baru

Sebuah website yang bertujuan untuk memudahkan perangkat desa dalam meningkatkan akuntabilitas pelaporan pembayaran Pajak Bumi dan Bangunan (PBB) di desa Fajar Baru. Selain itu, platform ini juga memudahkan masyarakat untuk melaporkan masalah dan keluhan secara langsung dan transparan.

---

## 🛠️ Teknologi & Framework

Aplikasi ini dibangun menggunakan tumpukan teknologi modern (Cloudflare Stack):

- **Frontend**: [React 19](https://react.dev/) & [Vite](https://vite.dev/)
- **Backend (API)**: [Hono](https://hono.dev/) berjalan di atas [Cloudflare Workers](https://workers.cloudflare.com/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQL Database)
- **Key-Value Store**: [Cloudflare KV](https://developers.cloudflare.com/kv/)
- **Routing**: React Router DOM

---

## 🚀 Panduan Memulai (Quick Start)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di lingkungan lokal Anda.

### 1. Prasyarat
Pastikan Anda sudah menginstal **Node.js** dan package manager (npm).

### 2. Instal Dependensi
Jalankan perintah berikut di direktori utama proyek:
```bash
npm install
```

### 3. Setup Database Lokal
Sebelum menjalankan aplikasi, inisialisasi database SQLite lokal menggunakan Wrangler D1 dengan menjalankan script PowerShell berikut:
```powershell
./setup-database-local.ps1
```
*Atau jalankan perintah D1 secara manual jika menggunakan sistem operasi lain:*
```bash
npx wrangler d1 execute website-desa --local --file=./schema.sql
npx wrangler d1 execute website-desa --local --file=./seed.sql
```

### 4. Jalankan Server Development
Jalankan perintah berikut untuk memulai server lokal:
```bash
npm run dev
```
Aplikasi dapat diakses melalui browser pada alamat yang tertera di terminal (biasanya `http://localhost:5173`).

---

## 📋 Script yang Tersedia

Berikut adalah daftar perintah npm yang dapat digunakan dalam pengembangan:

- `npm run dev` - Menjalankan development server lokal (Vite)
- `npm run build` - Melakukan kompilasi TypeScript dan membangun aset produksi
- `npm run lint` - Melakukan pengecekan kualitas kode dengan ESLint
- `npm run format` - Merapikan format kode dengan Prettier
- `npm run check` - Melakukan validasi build lokal dan deployment dry-run
- `npm run deploy` - Melakukan deployment langsung ke Cloudflare Workers

---

## 👥 Anggota Kelompok

| Nama | NIM |
| :--- | :--- |
| Andika Dinata | 123140096 |
| Ribka Hana Josephine Situmorang | 123140103 |
| Ardiansyah Fernando | 123140102 |
| Ibrahim Budi Satria | 123140097 |
| Ahmad Aufamahdi Salam | 123140092 |
| Ariq Ramadhinov Ronny | 123140105 |
| Aditya Ronal Maruli | 123140093 |
| Nabila Yuliana | 123140099 |
