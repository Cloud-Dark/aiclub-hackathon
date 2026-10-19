# Pendaftaran AI Agent Hackathon

React + Vite. Alur: Daftar → Skenario → Jalur → 2 langkah terakhir (gabung grup WhatsApp, share info ke grup).

```
npm install
npm run dev
```

Webhook: salin `.env.example` ke `.env`, isi `VITE_WEBHOOK_URL`. Data peserta (JSON, `Content-Type: text/plain` agar lolos CORS) dikirim satu kali saat peserta sampai layar terakhir.
