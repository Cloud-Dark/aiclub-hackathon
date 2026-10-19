# Pendaftaran AI Agent Hackathon

React + Vite. Alur: Daftar → Skenario → Jalur → 2 langkah terakhir (gabung grup WhatsApp, share info ke grup).

```
npm install
npm run dev
```

## Simpan data ke Google Sheets

1. Buat Google Sheet → Extensions → Apps Script → tempel isi `apps-script/Code.gs`.
2. Jalankan fungsi `setup` sekali, lalu Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
3. Salin URL `/exec` ke `.env`: salin `.env.example`, isi `VITE_GAS_URL`.

Data peserta (JSON flat, `Content-Type: text/plain` agar lolos CORS) dikirim satu kali saat peserta sampai layar terakhir. Kirim ulang (misal setelah menjawab ulang kuis) meng-update baris yang sama. Skor dan jalur dihitung ulang di server.
