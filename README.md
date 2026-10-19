# Pendaftaran AI Agent Hackathon

**Coba langsung: https://cloud-dark.github.io/aiclub-hackathon/**

Login dummy: pilih salah satu akun demo di halaman login (`rani@aiclub.id`, `bagas@aiclub.id`, `salsa@aiclub.id`), atau isi email apa saja dengan kata sandi bebas.

## Alur

1. Masuk dengan aiclub.id (dummy)
2. Lengkapi data yang kurang (kota dan WhatsApp wajib)
3. Skenario → Jalur
4. **Gabung grup WhatsApp utama (wajib)** — pasar tim baru terbuka setelah ini
5. Pasar tim: lamar ke beberapa tim (satu lamaran = satu grup tim), atau undang builder
6. Status: lamaran (menunggu / disetujui / ditolak), grup utama, tim saya, aktivitas, timeline sampai demo day

Owner tim membuka timnya di layar status, menempel link grup WhatsApp timnya, lalu menyetujui atau menolak pelamar.

## Masih dummy

Belum ada backend. Login, daftar tim, pelamar, dan keputusan owner semuanya data dummy yang tersimpan di `localStorage` browser masing-masing.

- Akun demo: `DUMMY_USERS` di `src/data.js`
- Tim dan builder contoh: `TIM`, `BUILDER` di `src/data.js`
- Tombol Setujui/Tolak untuk tim contoh: `CONFIG.demoOwner` di `src/data.js` (matikan saat backend tersambung)

## Pengembangan

```
npm install
npm run dev
```

## Build & GitHub Pages

Hasil build (HTML, CSS, JS) ada di folder `docs/` dan ikut di-commit, jadi GitHub Pages bisa langsung memakainya.

```
npm run build   # tulis ke docs/
```

Aktifkan Pages sekali: **Settings → Pages → Build and deployment → Deploy from a branch → Branch `main`, folder `/docs`**.
Setiap perubahan kode, jalankan `npm run build` lalu commit isi `docs/` bersama perubahannya.
