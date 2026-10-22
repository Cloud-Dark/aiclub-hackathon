# Backend

> Status: Diimplementasikan (Cloudflare Pages Functions + D1)
> Terakhir diperbarui: 2026-10-22

Backend mengikuti [../brief.md](../brief.md) bagian 5 sampai 6, dengan satu perbedaan: **tidak terhubung ke aiclub.id**. Akun dan database dikelola sendiri (D1 `aiclub-hackathon-db`). API ada di `/api/*` pada domain yang sama dengan situs.

## Struktur

| Path | Isi |
|---|---|
| `functions/api/[[path]].js` | Pintu masuk Pages Functions, meneruskan ke `server/app.js` |
| `server/app.js` | Router, cek session/peran, proteksi CSRF, pembersihan lamaran kedaluwarsa saat baca |
| `server/routes_me.js` | Register, login, logout, `GET/PATCH /me` |
| `server/routes_teams.js` | Tim, lamaran, undangan, anggota |
| `server/routes_content.js` | Pengumuman, chat, admin (ringkasan, ekspor CSV) |
| `migrations/` | Skema D1 dan seed pengumuman (`scripts/gen-seed.mjs` membuatnya dari `src/i18n`) |
| `wrangler.toml` | Binding D1 `DB`; `ADMIN_EMAILS` (secret) |
| `scripts/test-api.mjs` | Tes integrasi (117 kasus) |

## Auth

- `POST /api/auth/register` `{email, password, nama}`, `POST /api/auth/login`, `POST /api/auth/logout`.
- Sandi di-hash PBKDF2-SHA256; session = cookie `hk_session` (`HttpOnly`, `SameSite=Lax`, `Secure` di https, 30 hari), token disimpan sebagai hash SHA-256.
- Login dibatasi 8 percobaan gagal per email per 15 menit (`429`).
- Pengurus: email yang tercantum di secret `ADMIN_EMAILS` (pisah koma) mendapat peran `admin` saat register/login.
- Metode yang mengubah data menolak `Origin` yang beda host (`403`).

## Endpoint

Sama dengan [../brief.md](../brief.md) bagian 6 (kecuali `GET .../stream`: WebSocket belum ada, pakai polling `messages?after=`). Tambahan: `GET /api/hackathon/admin/overview`, `GET /api/hackathon/admin/participants.csv`. Error: `{ "error": { "code", "message" } }`.

## Perilaku yang perlu diketahui

- Syarat membuat tim/melamar (dicek server): data diri lengkap (nama, kota, WA), kuis selesai, `joined_main` sudah ditandai.
- Skor jalur dihitung server dari `jawaban`; `WEIGHTS` ada di `server/scoring.js` (salinan dari `src/data.js`, ubah keduanya bersamaan).
- Kedaluwarsa 24 jam: Pages Functions tidak punya Cron Trigger, jadi lamaran `pending` yang lewat batas diubah menjadi `expired` setiap ada request ke `/me`, `/teams*`, `/applications*`, `/builders`. Keputusan owner setelah `expires_at` ditolak `409`. Notifikasi sebelum batas belum ada.
- Anggota yang keluar atau tim yang ditutup: lamaran `approved` miliknya menjadi `withdrawn` supaya bisa memilih lagi.
- Chat: polling saja, 1000 karakter, 20 pesan/menit dan 500/hari per member.
- Belum ada: notifikasi, WebSocket, retensi chat, kota berbasis `cityId` (kota berupa teks).

## Menjalankan

```
echo 'ADMIN_EMAILS=admin@test.id' > .dev.vars
npm run db:migrate:local
npm run build && npm run dev:api        # http://localhost:8788
npm run test:api
```

Produksi: `npm run db:migrate` (butuh `CLOUDFLARE_API_TOKEN`), lalu deploy lewat Git seperti biasa.
