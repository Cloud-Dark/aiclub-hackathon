# Standard Kontribusi

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

## 1. Tujuan dan Lingkup

Standard ini mengatur cara semua perubahan masuk ke repositori `Cloud-Dark/aiclub-hackathon`: branch, commit, review, dan perlakuan khusus terhadap folder `docs/` yang berisi dokumentasi `.md` sekaligus hasil build GitHub Pages. Indeks standard ada di [00_STANDARD_INDEX.md](00_STANDARD_INDEX.md).

## 2. Kondisi Repositori Saat Ini

| Hal | Fakta |
|---|---|
| Remote | `https://github.com/Cloud-Dark/aiclub-hackathon` |
| Branch utama | `main` (sumber GitHub Pages, folder `/docs`) |
| Perintah | `npm run dev`, `npm run build`, `npm run preview` (lihat `package.json`) |
| CI | Belum ada (tidak ada `.github/`): _TBD_ |
| Linter, formatter, tes | Belum ada: _TBD_ (lihat [05_TESTING_STANDARD.md](05_TESTING_STANDARD.md)) |
| Aturan proteksi branch `main` | _TBD_ (belum terverifikasi) |

## 3. Alur Branch

1. Semua perubahan WAJIB dikerjakan di branch terpisah dari `main`. Commit langsung ke `main` DILARANG, kecuali rilis darurat yang dijelaskan di [07_RELEASE_STANDARD.md](07_RELEASE_STANDARD.md).
2. Penamaan branch: `<jenis>/<slug-singkat>` dengan huruf kecil dan tanda hubung.

| Jenis | Dipakai untuk | Contoh benar |
|---|---|---|
| `fitur` | Fitur baru | `fitur/layar-persetujuan-data` |
| `perbaikan` | Perbaikan bug | `perbaikan/lamaran-ganda` |
| `docs` | Hanya dokumentasi `.md` | `docs/standard-kontribusi` |
| `refaktor` | Perubahan struktur tanpa ubah perilaku | `refaktor/pisah-rules` |
| `rilis` | Persiapan rilis | `rilis/v1.1.0` |

   Contoh salah: `Fitur_Baru`, `perubahan`, `fix`, `budi-test`.

   Branch otomatis dari alat (misalnya awalan `claude/`) boleh dipakai selama isinya dirapikan sebelum PR dibuka.
3. Satu branch satu tujuan. PR yang mencampur fitur, refaktor, dan dokumentasi tidak terkait DILARANG.
4. Branch WAJIB diperbarui terhadap `main` (rebase atau merge) sebelum merge, dan WAJIB lolos `npm run build` tanpa galat.
5. Branch yang sudah merge WAJIB dihapus.

## 4. Pesan Commit

Riwayat repositori memakai kalimat bahasa Indonesia berawalan kata kerja dasar, tanpa titik akhir, dengan penjelasan setelah titik dua bila perlu. Contoh dari riwayat nyata: `Tambah brief.md: rencana integrasi login, session, dan database aiclub.id`; `Satu lamaran aktif per orang, halaman detail tim & grup, link WhatsApp hanya setelah disetujui`.

Format yang WAJIB diikuti:

```
<Kata kerja> <objek>: <alasan atau ringkasan, opsional>

<badan commit opsional: apa yang berubah dan mengapa, dibungkus sekitar 72 kolom>
```

| Aturan | Keterangan |
|---|---|
| Bahasa | Indonesia formal. Istilah teknis (nama fungsi, berkas) ditulis apa adanya dalam backtick. |
| Baris pertama | Maksimal 100 karakter, diawali kata kerja: Tambah, Ubah, Hapus, Perbaiki, Pindahkan, Perbarui, Refaktor. |
| Isi | Satu commit satu perubahan logis. |
| Rahasia | DILARANG memuat token, kunci, atau data pribadi peserta. |
| Berkas build | Commit yang mengubah `docs/assets/` atau `docs/index.html` WAJIB menyebut "build" pada pesan atau badan. |

Contoh benar:

```
Perbaiki canApply: tolak lamaran bila peserta sudah menjadi owner
```

```
Perbarui build docs/ untuk perubahan layar Market
```

Contoh salah:

```
fix
update stuff.
WIP
Menambahkan, memperbaiki, dan merapikan banyak hal sekaligus
```

Awalan (trailer) yang ditambahkan alat otomatis pada akhir pesan boleh dipertahankan.

## 5. Pull Request

1. Setiap perubahan ke `main` WAJIB lewat PR.
2. Judul PR mengikuti aturan baris pertama commit.
3. Deskripsi PR WAJIB memuat:
   - Ringkasan perubahan dan alasan.
   - Tangkapan layar atau keterangan perubahan tampilan bila UI berubah, termasuk pengecekan tiga bahasa (id, en, zh).
   - Daftar berkas `.md` yang disentuh dan alasannya, bila ada.
   - Apakah `docs/assets/` dan `docs/index.html` ikut berubah (build ulang).
   - Dampak pada aturan bisnis ([03_ARCHITECTURE_STANDARD.md](03_ARCHITECTURE_STANDARD.md)) dan keamanan ([04_SECURITY_STANDARD.md](04_SECURITY_STANDARD.md)).
4. PR DISARANKAN berukuran di bawah 400 baris diff di luar berkas build. PR yang lebih besar WAJIB dijelaskan alasannya atau dipecah.

## 6. Review

| Aturan | Tingkat |
|---|---|
| Minimal satu persetujuan reviewer selain penulis sebelum merge | WAJIB |
| Penulis menyetujui PR sendiri | DILARANG |
| Perubahan pada aturan bisnis (`src/lib/rules.js`, `src/lib/scoring.js`), cookie/session, atau handling data pribadi ditinjau dua orang | DISARANKAN |
| Reviewer menjalankan `npm run build` pada branch PR bila ada perubahan dependensi atau konfigurasi | DISARANKAN |
| Komentar review dibalas atau diselesaikan sebelum merge | WAJIB |
| Merge dengan metode squash bila banyak commit WIP; pesan hasil squash tetap mengikuti bagian 4 | DISARANKAN |

Daftar periksa reviewer:

- [ ] Sesuai [02_CODE_STANDARD.md](02_CODE_STANDARD.md): komponen fungsional, penamaan, teks lewat `t()`/`get()`.
- [ ] Teks baru ada di ketiga berkas `src/i18n/id.js`, `en.js`, `zh.js` dengan struktur kunci yang sama.
- [ ] Tidak ada rahasia, token, atau data pribadi sungguhan pada diff.
- [ ] Logika bisnis baru tidak hanya hidup di klien bila backend sudah tersambung.
- [ ] Dokumen turunan diperbarui sesuai [06_DOCUMENTATION_STANDARD.md](06_DOCUMENTATION_STANDARD.md).
- [ ] Bila `docs/assets/` berubah, build berasal dari commit sumber yang sama pada PR.

## 7. Aturan Menyentuh `docs/` (Dokumentasi dan Output Build)

Folder `docs/` memiliki dua peran yang bercampur:

| Isi | Asal | Boleh diedit tangan? |
|---|---|---|
| `docs/index.html` | Output `npm run build` | DILARANG |
| `docs/assets/` (JS dan CSS ber-hash) | Output `npm run build` | DILARANG |
| `docs/brand/` | Salinan `public/brand/` oleh Vite | DILARANG; ubah sumbernya di `public/brand/` lalu build |
| `docs/**/*.md` (termasuk `docs/standards/`) | Ditulis manual | WAJIB, sesuai [06_DOCUMENTATION_STANDARD.md](06_DOCUMENTATION_STANDARD.md) |

Dasar teknis: `vite.config.js` mengatur `outDir: "docs"`, `emptyOutDir: false`, dan plugin `clean-docs-assets` yang hanya menghapus `docs/assets` pada `buildStart`. Berkas `.md` aman dari build selama berada di luar `docs/assets/`, `docs/index.html`, dan `docs/brand/`.

Aturan:

1. DILARANG menaruh berkas `.md` atau berkas tulisan tangan lain di `docs/assets/`; folder itu dihapus setiap build.
2. DILARANG menaruh berkas tulisan tangan dengan nama `index.html` di `docs/`; berkas itu ditimpa build.
3. DILARANG mengubah `emptyOutDir` menjadi `true` atau menambah penghapusan di luar `docs/assets` pada `vite.config.js` tanpa keputusan tertulis, karena akan menghapus dokumentasi.
4. Bila `vite.config.js` berubah, perubahan WAJIB dijelaskan pada PR dan diverifikasi: jalankan `npm run build`, lalu pastikan `git status` tidak menunjukkan berkas `.md` terhapus.
5. Commit yang berisi perubahan kode sumber dan build WAJIB menyertakan hasil build ulang pada PR yang sama (README: "jalankan `npm run build` lalu commit isi `docs/` bersama perubahannya"). Commit build DISARANKAN dipisah dari commit kode agar diff mudah ditinjau.
6. Konflik merge pada `docs/assets/*` DILARANG diselesaikan manual. Selesaikan konflik kode sumber, lalu jalankan ulang `npm run build` dan commit hasilnya.
7. Berkas `.md` di `docs/` ikut tersaji publik bila GitHub Pages aktif dari `/docs`. DILARANG menulis rahasia, kredensial, data peserta, atau nomor WhatsApp sungguhan pada dokumentasi.
8. Perlakuan Jekyll pada Pages (misalnya berkas `.nojekyll`): _TBD_ (belum terverifikasi).

Contoh benar:

```
npm run build
git status           # hanya docs/index.html dan docs/assets/* berubah selain kode sumber
git add src docs
```

Contoh salah:

```
# menghapus seluruh docs/ lalu membangun ulang (akan menghapus dokumentasi .md)
rm -rf docs && npm run build
```

## 8. Dependensi

- Menambah dependensi WAJIB dibahas pada PR: alasan, ukuran dampak pada bundel, dan alternatif tanpa dependensi. Proyek saat ini hanya bergantung pada `react`, `react-dom`, `vite`, dan `@vitejs/plugin-react`.
- `package-lock.json` WAJIB ikut di-commit saat dependensi berubah.
- Menambah pustaka UI, state management, atau router DILARANG tanpa keputusan tertulis.

## 9. Isu dan Keputusan

- Pertanyaan terbuka dan keputusan arsitektur WAJIB dicatat pada dokumen keputusan (lihat [06_DOCUMENTATION_STANDARD.md](06_DOCUMENTATION_STANDARD.md)), bukan hanya pada percakapan PR.
- Rujukan rencana integrasi: [../../brief.md](../../brief.md).

## 10. Riwayat Dokumen

| Tanggal | Perubahan |
|---|---|
| 2026-10-21 | Draf awal. |
