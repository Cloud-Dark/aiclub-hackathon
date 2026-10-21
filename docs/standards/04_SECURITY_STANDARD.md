# Standard Keamanan

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

## 1. Tujuan dan Lingkup

Standard ini mengatur keamanan portal pendaftaran, baik kondisi sekarang (SPA statis dengan data dummy) maupun setelah integrasi dengan login, session, dan database aiclub.id ([../../brief.md](../../brief.md)). Batas lapisan ada di [03_ARCHITECTURE_STANDARD.md](03_ARCHITECTURE_STANDARD.md).

Fakta penting kondisi sekarang:

- Semua data peserta ada di `localStorage` (`hk_state`) dan dapat diubah siapa pun yang membuka DevTools. Karena itu tidak ada kontrol keamanan yang nyata pada mode dummy; mode dummy DILARANG dipakai menampung data pribadi sungguhan.
- Login dummy menerima email apa saja dengan sandi bebas ([../../README.md](../../README.md)). Sandi yang diketik DILARANG disimpan, dikirim, atau dicatat (kode `Login.jsx` saat ini tidak menyimpannya).
- Link grup WhatsApp pada `TIM` adalah placeholder; di produksi, link nyata hanya boleh dikirim server setelah lamaran disetujui.

## 2. Klasifikasi Data

| Kelas | Contoh | Perlakuan |
|---|---|---|
| Rahasia | Kunci pengurus `/agent/*`, token API, secret signing, kredensial DB | DILARANG ada di repositori, bundel, log, atau dokumentasi |
| Pribadi sensitif | Nomor WhatsApp, email, kota, LinkedIn peserta | Hanya ke pihak berhak; DILARANG di daftar publik, log, atau dokumentasi |
| Internal | Jawaban skenario, jalur, status lamaran | Hanya pemilik dan pihak berwenang |
| Publik | Info event, nama tim, kota tim, peran yang dicari | Boleh tampil di daftar tim |

## 3. Session dan Autentikasi (Setelah Integrasi)

Opsi login yang diusulkan (cookie bersama, OAuth/OIDC, magic link) belum dipilih; keputusan _TBD_ menunggu jawaban pengelola aiclub.id (brief bagian 4 dan 8). Aturan berikut berlaku untuk opsi mana pun.

### 3.1 Cookie Session

| Atribut | Nilai | Tingkat |
|---|---|---|
| `HttpOnly` | Aktif; JavaScript DILARANG membaca token session | WAJIB |
| `Secure` | Aktif; hanya lewat HTTPS | WAJIB |
| `SameSite` | `Lax` (sesuai usulan brief). `None` DILARANG kecuali ada kebutuhan lintas situs yang dicatat sebagai keputusan | WAJIB |
| `Domain` | `.aiclub.id` hanya bila portal di subdomain aiclub.id dan memang berbagi session; selain itu DILARANG | WAJIB |
| `Path` | `/` | WAJIB |
| Masa berlaku | Mengikuti kebijakan session aiclub.id: _TBD_ | WAJIB |
| Rotasi id session saat login | Aktif | WAJIB |
| Penyimpanan token di `localStorage`, `sessionStorage`, atau URL | Tidak boleh | DILARANG |

Contoh benar:

```
Set-Cookie: session=<opak>; Domain=.aiclub.id; Path=/; HttpOnly; Secure; SameSite=Lax
```

Contoh salah:

```
Set-Cookie: session=<jwt>            # tanpa HttpOnly/Secure/SameSite
localStorage.setItem("token", jwt)   # DILARANG
```

### 3.2 Aturan Autentikasi dan Otorisasi

1. Setiap endpoint WAJIB memeriksa session; tanpa session menjawab `401`. Pemeriksaan hanya di klien (misalnya `st.user`) DILARANG dianggap autentikasi.
2. Identitas pemohon WAJIB diambil dari session, bukan dari body atau parameter (`memberId` dari klien DILARANG dipercaya).
3. Otorisasi WAJIB dicek per sumber daya (misalnya hanya owner tim yang menyetujui lamaran timnya, selain itu `403`).
4. Logout WAJIB menghapus session di server dan berlaku di kedua sisi (portal dan aiclub.id).
5. Permintaan yang mengubah data WAJIB memakai metode `POST`, `PATCH`, atau `DELETE`, dan WAJIB memiliki perlindungan CSRF: pemeriksaan header `Origin`/`Referer` terhadap daftar asal yang diizinkan dan/atau token CSRF. Mengandalkan `SameSite=Lax` saja DILARANG karena subdomain aiclub.id lain berada pada situs yang sama.
6. CORS WAJIB membatasi asal ke domain portal; `Access-Control-Allow-Origin: *` bersama kredensial DILARANG.
7. Pada mode demo (GitHub Pages), halaman login WAJIB tetap diberi penanda "DUMMY" seperti pada kunci `login.badge`.

## 4. Rahasia dan Bundel Klien

1. Rahasia DILARANG berada di kode sumber, `public/`, `docs/`, atau variabel lingkungan berawalan `VITE_` (semua `VITE_*` ikut terkompilasi ke bundel dan terbaca publik).
2. Hanya konfigurasi non-rahasia yang boleh menjadi `VITE_*`: `VITE_API_BASE`, `VITE_LOGIN_URL`.
3. Berkas `.env`, `.env.local` WAJIB tetap tercantum di `.gitignore` (saat ini sudah, bersama `node_modules`).
4. Kunci API pengurus aiclub.id (`/agent/*`) DILARANG dipanggil dari klien; hanya dari server (brief bagian 4, prinsip 3).
5. Output build di `docs/assets/` WAJIB diperiksa sebelum rilis dengan pencarian pola rahasia (`key`, `secret`, `token`, `Bearer`); alat pemindaian otomatis: _TBD_.
6. Rahasia yang telanjur ter-commit WAJIB dianggap bocor: cabut dan ganti kredensial, bukan sekadar menghapus berkas.
7. Dokumentasi di `docs/` ikut tersaji publik lewat GitHub Pages ([01_CONTRIBUTION_STANDARD.md](01_CONTRIBUTION_STANDARD.md) bagian 7); DILARANG menuliskan rahasia atau data peserta di dalamnya.

## 5. Validasi Input

Aturan: klien memvalidasi untuk pengalaman pengguna; server WAJIB memvalidasi ulang semua input dan menolak yang tidak sah. Validasi klien DILARANG menjadi satu-satunya pemeriksaan.

| Input | Aturan klien saat ini | Aturan server (WAJIB) |
|---|---|---|
| Nama | Tidak kosong (`identDone`) | Tidak kosong, panjang maksimum ditetapkan: _TBD_ |
| Kota | Tidak kosong | Setelah integrasi berupa `cityId` valid dari `/agent/regions`, bukan teks bebas (brief 5.1) |
| WhatsApp peserta | `waValid`: 9 sampai 15 digit | Aturan sama atau lebih ketat; simpan dalam format ternormalisasi: _TBD_ |
| Email | `EMAIL_RE` | Validasi format; email berasal dari session aiclub.id, bukan dari input |
| Link grup WhatsApp tim | `WA_LINK_RE` | Validasi ulang pola yang sama pada simpan |
| Jawaban skenario | Indeks pilihan per soal | Setiap indeks dalam rentang opsi soal; panjang larik sesuai `quizLen` |
| Status lamaran | Nilai enum internal | Hanya nilai enum yang diizinkan dan transisi yang sah |
| Teks bebas (deskripsi tim) | Tidak dibatasi | Batas panjang, buang kendali karakter: _TBD_ |

Catatan perbaikan yang DISARANKAN pada `WA_LINK_RE`: pola saat ini `^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+` tidak memakai penutup `$`, sehingga teks tambahan setelah kode undangan ikut lolos. Pola yang diusulkan: `^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+$`. Perubahan ini WAJIB disertai tes ([05_TESTING_STANDARD.md](05_TESTING_STANDARD.md)).

Aturan tambahan:

1. Render teks pengguna WAJIB lewat JSX (di-escape otomatis). `dangerouslySetInnerHTML`, `innerHTML`, `eval`, dan `new Function` DILARANG.
2. URL yang berasal dari data pengguna WAJIB divalidasi skema `https:` sebelum dipakai pada `href` atau `window.open`. Skema `javascript:` dan `data:` DILARANG.
3. Kueri database WAJIB berparameter; penggabungan string SQL DILARANG.
4. Parameter `?lang=` hanya diterima bila ada di `I18N` (sudah dilakukan `detectLang()`); pola whitelist ini WAJIB dipakai untuk parameter URL lain.

## 6. Akses Link WhatsApp

Link grup WhatsApp adalah kunci masuk ke grup tim, sehingga diperlakukan sebagai data terbatas.

1. Link grup tim HANYA boleh ada di respons server untuk (a) owner tim dan (b) pelamar dengan status `approved`. Daftar tim publik DILARANG memuatnya.
2. Link TIDAK BOLEH dikirim ke klien lalu disembunyikan lewat CSS atau kondisi JSX; yang tidak berhak WAJIB tidak menerimanya sama sekali.
3. Saat lamaran ditarik, ditolak, atau tim ditutup, hak akses ke link WAJIB dicabut pada permintaan berikutnya.
4. Owner DISARANKAN dapat mengganti link bila bocor (fitur `saveTeamLink`); riwayat link lama tidak disimpan di klien.
5. Link grup WhatsApp utama (`WA_GROUP_URL` pada `data.js`) adalah link publik event dan boleh ada di bundel.
6. Pembukaan link WAJIB `noopener,noreferrer` (sudah pada `openTeamGroup`).
7. Mode dummy: link placeholder (`DummyRekon01` dan sejenisnya) DILARANG diganti dengan link grup nyata pada `data.js`, karena `data.js` ikut terkompilasi ke bundel publik.

Contoh benar (server):

```js
const dapatLihat = tim.ownerId === sesi.memberId || lamaranDisetujui(tim.id, sesi.memberId);
return dapatLihat ? { ...tim, wa_link: tim.wa_link } : omit(tim, "wa_link");
```

Contoh salah:

```js
return tim;   // wa_link ikut terkirim, klien yang menyembunyikan
```

## 7. Privasi Data

1. Prinsip minimum: kumpulkan hanya `memberId`, nama, email, kota, WhatsApp, LinkedIn, serta data alur hackathon yang diperlukan (brief bagian 5).
2. Nomor WhatsApp dan email peserta DILARANG tampil ke peserta lain; owner hanya melihat data yang diperlukan untuk menilai pelamar (nama, kota, peran, ringkasan): rincian _TBD_ pada spesifikasi.
3. Dasar persetujuan (consent): sebelum nomor WhatsApp atau kota tampil ke owner atau pengelola, perlu persetujuan member (brief bagian 8 butir 5). Layar persetujuan WAJIB ada bila persetujuan belum tercakup; keputusan _TBD_.
4. Data peserta DILARANG diekspor kecuali oleh peran berwenang (pengurus yang ditetapkan); peran _TBD_ (brief bagian 8 butir 7). Ekspor WAJIB tercatat (siapa, kapan).
5. Log aplikasi DILARANG memuat nomor WhatsApp, email penuh, link grup, atau isi session.
6. Retensi dan penghapusan data setelah event: _TBD_ (kebijakan belum ditetapkan). Permintaan penghapusan dari peserta WAJIB bisa dipenuhi lewat pengelola.
7. Data dummy WAJIB fiktif. Nama, email, dan nomor dummy DILARANG memakai data orang nyata di luar akun demo (`rani@aiclub.id`, `bagas@aiclub.id`, `salsa@aiclub.id`).
8. Tangkapan layar dan dokumentasi WAJIB menyamarkan data pribadi sungguhan.
9. Pihak ketiga: peramban memuat font dari Google Fonts (lihat `index.html`), sehingga alamat IP pengunjung terkirim ke Google. Keputusan hosting font mandiri: _TBD_.

## 8. Rate Limit dan Penyalahgunaan

Berlaku pada server setelah integrasi. Angka berikut adalah nilai awal yang DISARANKAN dan WAJIB dikonfirmasi saat implementasi; angka final dicatat pada spesifikasi.

| Endpoint | Kunci pembatas | Nilai awal yang disarankan |
|---|---|---|
| Login / pembuatan session | IP + akun | 10 percobaan per 15 menit |
| Semua endpoint tulis (`POST`/`PATCH`/`DELETE`) | `memberId` | 60 per menit |
| `POST .../apply` | `memberId` | 10 per jam |
| `POST .../teams` | `memberId` | 5 per jam |
| `POST .../invites` | `memberId` | 30 per jam |
| Semua endpoint baca | `memberId` atau IP | 300 per menit |

Aturan:

1. Pembatasan WAJIB di server atau di tepi (misalnya fitur rate limit Cloudflare); pembatasan di klien tidak dihitung.
2. Respons terlampaui batas WAJIB `429` dengan header `Retry-After`.
3. Klien WAJIB menampilkan pesan yang ramah (lewat i18n) dan DILARANG melakukan retry otomatis tanpa jeda.
4. Percobaan beruntun yang gagal WAJIB dicatat (tanpa data pribadi) agar bisa dipantau.
5. Aksi yang mengubah keanggotaan (`apply`, `decide`, `close`) WAJIB atomik; kondisi balapan (lamaran ganda) diselesaikan oleh constraint DB, bukan oleh pembatas laju.

## 9. Keamanan Rantai Pasok dan Build

1. Dependensi WAJIB dikunci lewat `package-lock.json` dan diperbarui lewat PR.
2. Menjalankan `npm audit` sebelum rilis DISARANKAN; temuan tingkat tinggi WAJIB ditangani atau dijelaskan.
3. Skrip pihak ketiga baru pada `index.html` DILARANG tanpa keputusan tertulis.
4. Header keamanan (`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`) WAJIB ditetapkan pada hosting produksi. GitHub Pages tidak mengizinkan header kustom; kontrol ini _TBD_ untuk demo.

## 10. Penanganan Insiden

1. Kecurigaan kebocoran (rahasia, link grup, data peserta) WAJIB dilaporkan ke pemilik dokumen ini segera dan dicatat tanggal serta dampaknya.
2. Langkah awal: cabut kredensial atau link yang bocor, ganti, lalu periksa log akses.
3. Kontak keamanan resmi dan jalur pelaporan: _TBD_.

## 11. Riwayat Dokumen

| Tanggal | Perubahan |
|---|---|
| 2026-10-21 | Draf awal. |
