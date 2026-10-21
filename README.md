# Pendaftaran AI Agent Hackathon

**Coba langsung: https://cloud-dark.github.io/aiclub-hackathon/**

Login dummy: pilih salah satu akun demo di halaman login (`rani@aiclub.id`, `bagas@aiclub.id`, `salsa@aiclub.id`), atau isi email apa saja dengan kata sandi bebas.

## Alur (3 langkah)

**1. Daftar di portal kita** (indikator kecil: Data → Skenario → Jalur → Grup utama → Tim → Status)
- Masuk dengan aiclub.id (dummy), lengkapi data (kota dan WhatsApp wajib), jawab skenario, dapat jalur
- Gabung grup WhatsApp utama (wajib)
- Pilih jalan: gabung tim atau buat tim. Satu orang hanya bisa jadi anggota satu tim, atau owner satu tim, tidak keduanya.
  - Gabung: lihat detail tim dan grupnya, lalu lamar. Hanya boleh satu lamaran aktif; mau pindah, tarik lamaran dulu. Link grup WhatsApp baru terbuka setelah owner menyetujui.
  - Buat: isi nama, slot yang dicari, dan link grup WhatsApp tim.
  - Bagikan: di dasbor owner ada link tim (`?tim=...`) untuk disalin atau dikirim ke WhatsApp. Orang yang membuka link melihat undangan, menyelesaikan pendaftaran, lalu langsung masuk ke halaman tim untuk melamar. Link grup WhatsApp tim tidak ikut di link ini.
  - Mau pindah pilihan: owner menutup tim dulu, anggota keluar dari tim dulu, atau tarik lamaran yang masih menunggu.
- Status: lamaran, tim saya (pelamar masuk, undang builder), aktivitas, timeline sampai demo day

**2. Daftarkan tim ke portal Tencent** — https://aiclub.id/l/O3Sa9yF

**3. Submit project ke Tencent** — https://aiclub.id/l/9k54mLk. Dikerjakan nanti setelah project selesai dibuat; tombol submit baru terbuka setelah peserta mencentang bahwa project sudah selesai.

## Info event

Data event (hadiah USD 3.100, 3 tantangan, tanggal penting, mitra) diambil dari halaman resmi
https://aiclub.id/event/tencent-cloud-hackathon-2026. Teks ada di `src/i18n/*.js` (kunci `event`, `schedule`),
logo dan poster di `public/brand/`.

## Masih dummy

Belum ada backend. Login, daftar tim, pelamar, dan keputusan owner semuanya data dummy yang tersimpan di `localStorage` browser masing-masing.

- Akun demo: `DUMMY_USERS` di `src/data.js`
- Link undangan tim: data tim dikodekan di URL (`src/lib/share.js`) dan disimpan di browser pengunjung. Lamaran lewat link belum sampai ke owner; itu butuh backend.
- Tim dan builder contoh: `TIM`, `BUILDER` di `src/data.js`. Link grup tim contoh (`wa`) hanya placeholder; dengan backend sungguhan, link hanya boleh dikirim setelah lamaran disetujui.
- Link portal Tencent: `TENCENT_REGISTER_URL`, `TENCENT_SUBMIT_URL` di `src/data.js`
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
