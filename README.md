# E-Presensi FORUM ASISTEN

![Last Commit](https://img.shields.io/badge/last%20commit-last%20sunday-blue) ![JavaScript](https://img.shields.io/badge/javascript-88.3%25-yellow) ![Languages](https://img.shields.io/badge/languages-4-blue)

## 🛠 Built with the tools and technologies:

![JSON](https://img.shields.io/badge/-JSON-black)
![npm](https://img.shields.io/badge/-npm-red)
![JavaScript](https://img.shields.io/badge/-JavaScript-yellow)
![Go](https://img.shields.io/badge/-Go-00ADD8)
![React](https://img.shields.io/badge/-React-61DAFB)
![Gin](https://img.shields.io/badge/-Gin-00ACC1)
![MySQL](https://img.shields.io/badge/-MySQL-4479A1)
![Cloudinary](https://img.shields.io/badge/-Cloudinary-3448c5)
![Vite](https://img.shields.io/badge/-Vite-646CFF)
![ESLint](https://img.shields.io/badge/-ESLint-4B32C3)
![Axios](https://img.shields.io/badge/-Axios-5A29E4)
![YAML](https://img.shields.io/badge/-YAML-cf142b)

---

## 📚 Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Mulai Cepat](#mulai-cepat)
  - [Prasyarat](#prasyarat)
  - [Instalasi](#instalasi)
  - [Penggunaan](#penggunaan)
  - [Pengujian](#pengujian)

---

## 🔍 Gambaran Umum

**forum_asisten** adalah platform full-stack yang dirancang untuk institusi pendidikan guna mengelola jadwal, presensi, dan data pengguna secara efisien. Aplikasi ini menggabungkan backend yang kuat menggunakan Golang dan Gin dengan frontend modern berbasis React, memastikan alur data yang lancar dan pengalaman pengguna yang optimal.

### Kenapa menggunakan e-presensi forum asisten?

Proyek ini bertujuan untuk menyederhanakan manajemen rekapitulasi presensi asisten praktikum melalui penanganan dependensi yang andal dan arsitektur modular. Fitur utama meliputi:

- 🔐 **Kontrol Akses Berbasis Peran**: Sistem autentikasi JWT dengan perlindungan rute khusus sesuai peran pengguna.
- 🧭 **Organisasi Rute API**: Endpoint yang terstruktur untuk manajemen pengguna, jadwal, dan presensi.
- 🛠️ **Integritas Dependensi**: Menjamin build yang konsisten dengan `go.mod` dan `go.sum`.
- 🎨 **Frontend Modern**: React & Tailwind CSS untuk tampilan antarmuka yang responsif dan dinamis.
- 📊 **Dashboard Admin**: Menyajikan metrik sistem dan manajemen data dengan mudah.
- 🧰 **Fungsi Utilitas**: Penanganan tanggal dan manajemen state untuk pengalaman pengembangan yang lancar.

---

## 🚀 Mulai Cepat

### Prasyarat

Pastikan Anda memiliki:

- **Bahasa Pemrograman**: JavaScript & Go
- **Package Manager**: Go modules & npm

---

### ⚙️ Instalasi

1. **Klon repositori ini:**

   ```bash
   git clone https://github.com/Azzerith/forum_asisten
   ```

2. **Masuk ke direktori proyek:**

   ```bash
   cd forum_asisten
   ```

3. **Install dependensi:**

   Menggunakan **go modules**:

   ```bash
   go build
   ```

   Menggunakan **npm**:

   ```bash
   npm install
   ```

---

## ▶️ Penggunaan

Jalankan proyek menggunakan perintah berikut:

Menggunakan **go modules**:

```bash
go run main.go
```

Menggunakan **npm**:

```bash
npm run dev
```

---

## 🧪 Pengujian

**forum_asisten** menggunakan `{test_framework}` untuk menjalankan pengujian. Jalankan tes dengan:

Menggunakan **go modules**:

```bash
go test ./...
```

Menggunakan **npm**:

```bash
npm test
```

---

u can accsess in there 
http://forum-asisten.vercel.app/
