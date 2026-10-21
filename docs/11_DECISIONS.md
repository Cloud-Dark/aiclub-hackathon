# Catatan Keputusan Arsitektur

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Dokumen ini mencatat keputusan penting dalam format ADR ringkas. Tanggal keputusan bertumpu pada `git log` (tanggal commit) atau tanggal dokumen. Status: Diterima, Diusulkan, Digantikan. Keputusan berstatus Diusulkan menunggu Fase 0 di [06_IMPLEMENTATION_PLAN.md](06_IMPLEMENTATION_PLAN.md). Dokumen terkait: [03_FRD.md](03_FRD.md), [04_TRD.md](04_TRD.md), [10_RISK_REGISTER.md](10_RISK_REGISTER.md), [../brief.md](../brief.md).

## Indeks

| ADR | Judul | Status | Tanggal |
|---|---|---|---|
| ADR-001 | SPA React + Vite, tanpa backend | Diterima | 2026-10-19 |
| ADR-002 | Hasil build di `docs/` untuk GitHub Pages | Diterima | 2026-10-19 |
| ADR-003 | State dummy di `localStorage` | Diterima (sementara) | 2026-10-19 |
| ADR-004 | Alur 3 langkah | Diterima | 2026-10-19 |
| ADR-005 | Gabung grup WhatsApp utama wajib sebelum pasar tim | Diterima | 2026-10-19 |
| ADR-006 | Satu orang satu tim (anggota atau owner) | Diterima | 2026-10-19 |
| ADR-007 | Satu lamaran aktif per orang | Diterima | 2026-10-19 |
| ADR-008 | Link WhatsApp tim hanya setelah lamaran disetujui | Diterima | 2026-10-19 |
| ADR-009 | Batas pendaftaran tetap menggantikan jadwal 6 minggu | Diterima | 2026-10-19 |
| ADR-010 | i18n tiga bahasa (id, en, zh) | Diterima | 2026-10-19 |
| ADR-011 | `emptyOutDir` dimatikan; hanya `docs/assets` dibersihkan | Diterima | 2026-10-21 |
| ADR-012 | Cookie session bersama di `*.aiclub.id` (opsi A) | Diusulkan | 2026-10-21 |
| ADR-013 | Cloudflare Worker sebagai BFF di atas D1 aiclub.id | Diusulkan | 2026-10-21 |

---

## ADR-001: SPA React + Vite, tanpa backend

- **Status:** Diterima
- **Tanggal:** 2026-10-19 (commit "Pecah form pendaftaran jadi React + Vite")
- **Keputusan:** Portal dibangun sebagai aplikasi React 18 + Vite 5 satu halaman tanpa backend (`package.json`).
- **Konteks:** Versi awal berupa satu form yang terhubung ke Apps Script dan webhook; form besar menimbulkan re-render glitch. Prototipe perlu cepat didemokan.
- **Alternatif ditolak:** Mempertahankan form tunggal dan Apps Script (dihapus pada commit 2026-10-19 "Hapus Apps Script"; sulit menjaga aturan tim dan lamaran). Framework dengan SSR (tidak diperlukan untuk prototipe).
- **Konsekuensi:** Tidak ada penyimpanan bersama; aturan bisnis hanya di klien (lihat R6, R8 di [10_RISK_REGISTER.md](10_RISK_REGISTER.md)).

## ADR-002: Hasil build di `docs/` untuk GitHub Pages

- **Status:** Diterima
- **Tanggal:** 2026-10-19
- **Keputusan:** `vite build` menulis ke `docs/` (`base: "./"`) dan hasilnya di-commit; GitHub Pages memakai branch `main`, folder `/docs` (README.md).
- **Konteks:** Butuh hosting statis tanpa pipeline CI; tautan demo `https://cloud-dark.github.io/aiclub-hackathon/`.
- **Alternatif ditolak:** Pipeline GitHub Actions (belum diperlukan; _TBD_ bila dipertimbangkan ulang). Hosting lain (tidak diperlukan untuk demo).
- **Konsekuensi:** Setiap perubahan kode memerlukan build dan commit `docs/`. Pages di `github.io` tidak dapat berbagi cookie dengan aiclub.id (R2). Pada produksi, hosting dipindah (brief 7 butir 8). Dampak terhadap dokumentasi: lihat ADR-011.

## ADR-003: State dummy di `localStorage`

- **Status:** Diterima (sementara, sampai Fase 2 dan 3)
- **Tanggal:** 2026-10-19
- **Keputusan:** Login, data peserta, tim, pelamar, dan keputusan owner disimulasikan dan disimpan di `localStorage` key `hk_state` (`PERSIST` di `src/App.jsx`); bahasa di key `hk_lang`.
- **Konteks:** Belum ada backend maupun akses ke sistem aiclub.id; prototipe perlu menunjukkan alur utuh.
- **Alternatif ditolak:** Backend sementara buatan sendiri (menambah sistem yang kelak dibuang; identitas akan terpisah dari aiclub.id).
- **Konsekuensi:** Data tidak berpindah antarperangkat; dapat dimanipulasi; akan digantikan `GET /me` dan API (Fase 1 sampai 3). `CONFIG.demoOwner` menampilkan tombol simulasi owner dan harus dimatikan saat backend tersambung.

## ADR-004: Alur 3 langkah

- **Status:** Diterima
- **Tanggal:** 2026-10-19 (commit "Alur 3 langkah")
- **Keputusan:** Pengalaman peserta dibagi tiga langkah: (1) daftar di portal ini (data, skenario, jalur, grup utama, tim, status), (2) daftarkan tim ke portal Tencent, (3) submit project ke Tencent. Langkah 1 memiliki indikator kecil (Data, Skenario, Jalur, Grup utama, Tim, Status). Tombol submit terbuka setelah peserta mencentang bahwa project selesai.
- **Konteks:** Pendaftaran tim dan submit karya dilakukan di portal Tencent lewat link `aiclub.id/l/...`; portal ini mengurus pembentukan tim.
- **Alternatif ditolak:** Menyatukan pendaftaran Tencent ke portal ini (di luar kendali; brief bagian 1 menyatakan di luar cakupan).
- **Konsekuensi:** Alur tidak diubah oleh integrasi aiclub.id (brief bagian 1).

## ADR-005: Gabung grup WhatsApp utama wajib sebelum pasar tim

- **Status:** Diterima
- **Tanggal:** 2026-10-19
- **Keputusan:** Peserta wajib bergabung ke grup utama (`WA_GROUP_URL`) sebelum masuk pilihan tim; guard di `initState()` dan `gotoStep`.
- **Konteks:** Info resmi dan pengumuman ada di grup utama (`group.s1b` di `src/i18n/id.js`).
- **Alternatif ditolak:** Grup utama opsional (info penting dapat terlewat).
- **Konsekuensi:** Status `joinedMain` harus tersimpan server (Fase 2). Verifikasi keanggotaan nyata tidak dilakukan: peserta hanya mengonfirmasi sendiri (_TBD_ apakah perlu diverifikasi).

## ADR-006: Satu orang satu tim (anggota atau owner)

- **Status:** Diterima
- **Tanggal:** 2026-10-19 (commit "Wizard tim")
- **Keputusan:** Satu orang hanya anggota satu tim atau owner satu tim, tidak keduanya. Pindah pilihan: owner menutup tim, anggota keluar, pelamar menarik lamaran.
- **Konteks:** Mencegah satu peserta terdaftar di banyak tim; wizard memisahkan jalur "gabung" dan "buat" secara eksklusif (`canApply`, `canCreate` di `src/lib/rules.js`).
- **Alternatif ditolak:** Boleh menjadi owner sekaligus anggota (membingungkan kepemilikan dan jadwal).
- **Konsekuensi:** Di produksi harus ditegakkan server dan constraint `owner_id UNIQUE` (brief 5.3 butir 1 dan 5).

## ADR-007: Satu lamaran aktif per orang

- **Status:** Diterima
- **Tanggal:** 2026-10-19
- **Keputusan:** Lamaran aktif (`pending` atau `approved`) maksimal satu per orang. Mau pindah, tarik lamaran dahulu. Saat satu lamaran disetujui, lamaran `pending` lain otomatis ditarik (`decideApp` di `src/App.jsx`).
- **Konteks:** Mengurangi lamaran massal ke banyak tim dan beban owner.
- **Alternatif ditolak:** Melamar ke banyak tim sekaligus (mengakibatkan persetujuan ganda dan pembatalan berantai).
- **Konsekuensi:** Di produksi memakai indeks unik parsial `one_active_app` dan transaksi (brief 5.2 dan 5.3); risiko race di R3.

## ADR-008: Link WhatsApp tim hanya setelah lamaran disetujui

- **Status:** Diterima
- **Tanggal:** 2026-10-19
- **Keputusan:** Link grup WhatsApp tim hanya terbuka bagi owner dan pelamar yang disetujui.
- **Konteks:** Link grup yang terbuka dapat disalahgunakan; owner perlu mengendalikan siapa yang masuk.
- **Alternatif ditolak:** Link terlihat di daftar tim publik.
- **Konsekuensi:** Pada prototipe, `wa` ada di `TIM` dan terbawa di bundel (R7), hanya placeholder. Produksi: server mengirim `wa_link` hanya untuk yang berhak (brief 5.3 butir 4).

## ADR-009: Batas pendaftaran tetap menggantikan jadwal 6 minggu

- **Status:** Diterima
- **Tanggal:** 2026-10-19 (commit "Revisi pusat: ganti 6 minggu dengan batas pendaftaran 1 Nov, hapus kartu target peserta")
- **Keputusan:** Jadwal mingguan diganti jadwal resmi event: pendaftaran 15 Okt, batas 1 Nov 23.59 WIB, pengumuman finalis 14 Nov, Demo Day 27 Nov (`schedule` di `src/i18n/id.js`).
- **Konteks:** Data resmi diambil dari halaman event aiclub.id.
- **Alternatif ditolak:** Mempertahankan rencana 6 minggu dan kartu target peserta (tidak sesuai jadwal resmi).
- **Konsekuensi:** Tenggat 1 Nov membatasi waktu integrasi (R5; [08_ROADMAP.md](08_ROADMAP.md)).

## ADR-010: i18n tiga bahasa (id, en, zh)

- **Status:** Diterima
- **Tanggal:** 2026-10-19
- **Keputusan:** Seluruh teks berada di `src/i18n/id.js`, `en.js`, `zh.js` dengan pemilih bahasa di header; bahasa tersimpan di `hk_lang`.
- **Konteks:** Event bermitra dengan Tencent Cloud; peserta dan mitra berbahasa berbeda.
- **Alternatif ditolak:** Hanya Bahasa Indonesia (kurang menjangkau mitra).
- **Konsekuensi:** Setiap teks baru wajib tersedia di tiga berkas. Sebagian teks event dirujuk sebagai satu sumber dari halaman resmi.

## ADR-011: `emptyOutDir` dimatikan; hanya `docs/assets` dibersihkan

- **Status:** Diterima
- **Tanggal:** 2026-10-21
- **Keputusan:** Di `vite.config.js`, `build.emptyOutDir` diset `false` dan plugin `clean-docs-assets` menghapus hanya `docs/assets` saat `buildStart`.
- **Konteks:** `outDir` adalah `docs/`, folder yang kini juga memuat dokumentasi `.md`. Perilaku bawaan Vite akan menghapus seluruh isi `docs/` setiap build.
- **Alternatif ditolak:** Memindahkan dokumentasi ke folder lain (merusak konvensi `docs/` bernomor); memindahkan keluaran build ke folder lain (merusak konfigurasi Pages `main` + `/docs`).
- **Konsekuensi:** Berkas hasil build lain di `docs/` (mis. `index.html`, `brand/`) ditimpa saat build; berkas usang di luar `assets` tidak otomatis dibersihkan. Perbaikan dikerjakan Alya pada 2026-10-21 (R11).

## ADR-012: Cookie session bersama di `*.aiclub.id` (opsi A) vs OAuth

- **Status:** Diusulkan (menunggu jawaban brief 8.1 dan 8.2)
- **Tanggal:** 2026-10-21 (brief.md bagian 4)
- **Keputusan (usulan):** Portal di subdomain aiclub.id (mis. `hackathon.aiclub.id`) memakai session aiclub.id lewat cookie `Domain=.aiclub.id`, `HttpOnly`, `Secure`, `SameSite=Lax`.
- **Konteks:** Tujuan integrasi: satu identitas (`memberId`), tanpa sistem login terpisah. Katalog API agen yang diketahui tidak memuat endpoint OAuth atau profil member untuk pihak ketiga (brief bagian 3).
- **Alternatif:** B, OAuth/OIDC (perlu provider OAuth dari aiclub.id; cocok bila portal di domain lain). C, token sekali pakai (cepat, tetapi rawan replay dan perlu masa berlaku pendek). Pilihan akhir: _TBD_.
- **Konsekuensi:** Perlu akses ke cara validasi session; GitHub Pages tidak lagi cocok untuk produksi (R2).

## ADR-013: Cloudflare Worker sebagai BFF di atas D1 aiclub.id

- **Status:** Diusulkan (menunggu jawaban brief 8.3 dan 8.8)
- **Tanggal:** 2026-10-21 (brief.md bagian 4)
- **Keputusan (usulan):** Backend-for-frontend berupa Cloudflare Worker/Pages Functions di `/api/hackathon/*` memvalidasi session, menjalankan logika bisnis, dan mengakses tabel `hackathon_*` di D1 aiclub.id.
- **Konteks:** Infrastruktur aiclub.id memakai Cloudflare (D1, R2) menurut brief bagian 3; key pengurus `/agent/*` tidak boleh berada di browser.
- **Alternatif:** Menggabungkan ke aplikasi aiclub.id yang ada; memakai API aiclub.id tanpa binding D1 langsung. Pilihan akhir: _TBD_.
- **Konsekuensi:** Aturan bisnis dan constraint pindah ke server (Fase 3); lokasi kode Worker dan pelaksana migrasi masih _TBD_.
