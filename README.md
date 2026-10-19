# Pendaftaran AI Agent Hackathon

React + Vite.

```
npm install
npm run dev
```

## Alur

1. Daftar → Skenario → Jalur
2. **Gabung grup WhatsApp utama (wajib)** — pasar tim baru terbuka setelah ini
3. Pasar tim: lamar ke beberapa tim (satu lamaran = satu grup tim), atau undang builder
4. Status: lamaran (menunggu / disetujui / ditolak), grup utama, tim saya, aktivitas, dan timeline sampai demo day

Owner tim membuka timnya sendiri di layar status, menempel link grup WhatsApp timnya, lalu menyetujui atau menolak pelamar. Pelamar yang disetujui melihat tombol gabung grup tim.

## Mode demo

Belum ada backend, semua data tersimpan di `localStorage` perangkat. Keputusan owner untuk tim contoh disimulasikan lewat tombol Setujui/Tolak di layar status (`CONFIG.demoOwner` di `src/data.js`; matikan saat backend sungguhan tersambung).
