# Glosarium

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Daftar istilah yang dipakai di portal pendaftaran AI Agent Hackathon aiclub.id x Tencent Cloud dan dokumentasinya, diurutkan alfabet. Sumber: `src/i18n/id.js`, `src/data.js`, `src/lib/*.js`, `src/App.jsx`, `README.md`, dan [../brief.md](../brief.md). Istilah teknis di kolom "Lokasi" menunjuk ke berkas atau kunci i18n tempat istilah itu muncul. Dokumen terkait: [04_TRD.md](04_TRD.md), [14_SECURITY_THREAT_MODEL.md](14_SECURITY_THREAT_MODEL.md), [17_DEVELOPER_SETUP.md](17_DEVELOPER_SETUP.md).

Keterangan: istilah bertanda (rencana) belum ada di kode dan hanya berasal dari [../brief.md](../brief.md).

## Tabel Istilah

| Istilah | Definisi | Lokasi / sumber |
|---|---|---|
| AI (jalur) | Kode jalur "AI / Agent engineer": orang yang memikirkan agent sebagai sistem yang bisa salah (tool-calling, batas wewenang, evaluasi). | `roles.AI` di `id.js`; `URUT` di `data.js` |
| AIClub / aiclub.id | Komunitas dan situs penyelenggara event bersama Tencent Cloud. Penyedia akun yang rencananya dipakai untuk login (lihat Login aiclub.id). | `event.collab`; [../brief.md](../brief.md) |
| Aktivitas (log) | Riwayat tindakan peserta (gabung grup utama, melamar, menarik, disetujui, ditolak, ditolak otomatis karena kedaluwarsa, buka/tutup tim, undang, keluar, kirim chat tim). Disimpan maksimal 60 entri terakhir di state klien; pada rencana akan menjadi tabel `hackathon_activity`. | `withLog` di `App.jsx`; `dash.log.*` |
| Anggota | Peserta yang lamarannya disetujui owner sehingga tergabung di satu tim. Tidak boleh sekaligus menjadi owner. | `dash.memberTag`; `src/lib/rules.js` |
| API agen (`/api/v1/agent/...`) | Katalog API pengurus/agen aiclub.id yang memakai key milik pengurus. Tidak boleh dipanggil dari browser. | [../brief.md](../brief.md) bagian 3 |
| Approve / Setujui | Keputusan owner menerima pelamar. Pada kode: status `approved`. Efek: tautan grup tim terbuka bagi pelamar dan lamaran `pending` lain miliknya dibatalkan otomatis. | `decideApp`, `decideApplicant` di `App.jsx` |
| Auto-withdraw / Batal otomatis | Pembatalan otomatis lamaran `pending` lain milik seseorang saat satu lamarannya disetujui. Log: `autoWithdraw`. Pada rencana: status `withdrawn`, dalam satu transaksi. | `App.jsx`; [../brief.md](../brief.md) 5.3 |
| Base `"./"` | Pengaturan Vite agar jalur aset relatif sehingga build berjalan di sub-path GitHub Pages. | `vite.config.js` |
| Batas keputusan owner | Waktu maksimum owner untuk menyetujui atau menolak lamaran, dihitung sejak lamaran masuk: `CONFIG.approveHours` (24 jam). Sisa waktu tampil ke pelamar dan owner; lewat batas, lamaran kedaluwarsa (lihat Kedaluwarsa). | `src/lib/rules.js`; `deadline.*` |
| BFF (Backend for Frontend) (rencana) | Lapisan server tipis (Cloudflare Worker/Pages Functions) di `hackathon.aiclub.id` yang memeriksa session dan menjalankan logika bisnis sebelum ke basis data. | [../brief.md](../brief.md) bagian 4 |
| Brief | Berkas `brief.md` berisi rencana integrasi portal dengan aiclub.id (status: draf untuk didiskusikan). | [../brief.md](../brief.md) |
| Builder | Peserta yang sedang mencari tim; muncul pada daftar "Builder yang cari tim" dan dapat diundang owner. Data contoh: `BUILDER`. | `data.js`; `market.tabBuilders` |
| CEO (jalur) | Kode jalur "CEO / Pemilik ide": bergerak dari arah dan orang; memilih masalah yang layak dan menarik orang. Pada mode `modeDraft`, hanya jalur ini yang boleh membuka tim. | `roles.CEO`; `Result.jsx` |
| Chat tim | Percakapan di dalam portal antara owner dan anggota satu tim, di ruang tim. Pesan maksimal 1000 karakter; 200 pesan terakhir per tim disimpan di state `chats`. Mode demo: pesan hanya tersimpan di perangkat ini; rencana: tersinkron lewat server. | `TeamRoom.jsx`; `sendChat` di `App.jsx`; `room.*` |
| `CONFIG` | Objek konfigurasi di `data.js`: `modeDraft` (false), `quizLen` (6), `demoOwner` (true), `approveHours` (24). | `src/data.js` |
| Cookie session (rencana) | Cookie `HttpOnly`, `Secure`, `SameSite=Lax`, `Domain=.aiclub.id` untuk login bersama. | [../brief.md](../brief.md) opsi A |
| CSRF | Cross-Site Request Forgery: serangan memaksa browser yang sedang login mengirim permintaan mutasi. Relevan setelah ada cookie session. | [14_SECURITY_THREAT_MODEL.md](14_SECURITY_THREAT_MODEL.md) |
| CTO (jalur) | Kode jalur "CTO / Engineer": bergerak dari yang bisa dijalankan; membuka editor dulu, bukan dokumen. | `roles.CTO` |
| D1 | Basis data SQL Cloudflare yang dipakai aiclub.id; target penyimpanan tabel `hackathon_*`. | [../brief.md](../brief.md) bagian 3 dan 5 |
| Dasbor (`dasbor`) | Layar status peserta: lamaran, tim saya, aktivitas, linimasa menuju Demo Day, grup utama. | `Dash.jsx`; `SCREENS` |
| DAT (jalur) | Kode jalur "Data analyst": orang yang membuktikan agent membantu dengan angka sebelum dan sesudah. | `roles.DAT` |
| Data diri (`identitas`) | Layar pengisian nama, kota, email, WhatsApp, LinkedIn, GitHub, dan latar. Kota dan WhatsApp wajib. | `Identity.jsx`; `identDone` |
| Demo Day | Presentasi finalis di Jakarta pada 27 Nov (13.00-16.00 WIB), disertai awarding. | `event.dates`; `schedule` |
| `demoOwner` | Sakelar `CONFIG.demoOwner` yang menampilkan tombol simulasi keputusan owner pada tim contoh; harus dimatikan saat backend tersambung. | `data.js`; `Dash.jsx` |
| Domain expert (DOM) | Kode jalur "Domain expert (ops, risk, finance)": paham bagaimana pekerjaan benar-benar berjalan hari ini. | `roles.DOM` |
| DSG (jalur) | Kode jalur "Designer": menyadari prototipe jalan tapi tak bisa dipakai; fokus alur, bukan hiasan. | `roles.DSG` |
| DUMMY_USERS | Tiga akun demo (`rani@`, `bagas@`, `salsa@aiclub.id`) dengan profil sengaja tidak lengkap. | `src/data.js` |
| emptyOutDir | Opsi Vite `build.emptyOutDir`. Sejak perbaikan 2026-10-21 bernilai `false` agar `docs/*.md` tidak terhapus; hanya `docs/assets` dibersihkan. | `vite.config.js`; [18_INSTALLATION.md](18_INSTALLATION.md) |
| Event | Tencent Cloud Hackathon Indonesia 2026 (kolaborasi Tencent Cloud dan AICLUB.ID, gratis), total hadiah USD 3.100, tiga tantangan. | `event.*` |
| Finalis | Tim yang lolos seleksi dan tampil di Demo Day; diumumkan 14 Nov. | `schedule` |
| GAS / Apps Script | Skrip Google Apps Script lama untuk menampung pendaftaran; dihapus pada 2026-10-19. | Riwayat git (commit `582836c`) |
| Gerbang (gate) | Syarat yang harus dipenuhi sebelum layar berikutnya: data diri lengkap, kuis selesai, grup utama diikuti. | `reachable`, `subReachable` di `scoring.js` |
| GitHub (kolom) | Tautan profil GitHub peserta, opsional, di data diri; ikut di pesan perkenalan dan kontak ruang tim. | `Identity.jsx`; `st.github` |
| Grup tim | Grup WhatsApp milik satu tim; tautannya dibuat owner dan hanya boleh terbuka bagi owner dan anggota yang disetujui. | `Create.jsx`; `TeamDetail.jsx` |
| Grup utama | Grup WhatsApp resmi hackathon (`WA_GROUP_URL`); wajib diikuti sebelum masuk pasar tim. Berbeda dari grup tim. | `group.*`; `data.js` |
| GRW (jalur) | Kode jalur "Growth / Marketing": memikirkan siapa pemakai berikutnya dan bagaimana mereka tahu. | `roles.GRW` |
| `hk_lang` | Kunci `localStorage` untuk bahasa pilihan. | `setLang` di `App.jsx`; `detectLang` |
| `hk_state` | Kunci `localStorage` untuk seluruh state peserta (daftar kunci pada `PERSIST`). | `App.jsx` |
| i18n | Internasionalisasi: teks antarmuka dalam tiga bahasa (`id`, `en`, `zh`) di `src/i18n/*.js`, diakses lewat `makeT`. Bahasa `id` menjadi fallback. | `src/i18n/index.js` |
| IDOR | Insecure Direct Object Reference: mengakses objek milik orang lain dengan mengganti ID (mis. lamaran atau tim). | [14_SECURITY_THREAT_MODEL.md](14_SECURITY_THREAT_MODEL.md) |
| Indeks unik `one_active_app` (rencana) | Batasan basis data: satu orang hanya boleh punya satu lamaran berstatus `pending` atau `approved`. | [../brief.md](../brief.md) 5.2 |
| Jalur | Peran yang paling cocok bagi peserta, hasil skor kuis. Delapan kode: CEO, CTO, AI, PM, DSG, GRW, DOM, DAT. Dapat dikoreksi manual (`override`). | `Result.jsx`; `scoring.js` |
| Jalur kedua | Jalur dengan skor tertinggi kedua; ditampilkan pada hasil dan dalam pesan perkenalan. | `result.second`; `shareText` |
| Jalur utama / aktif | Jalur yang dipakai di pasar tim: `override` bila ada, jika tidak skor tertinggi. Fungsi `aktif(st)`. | `scoring.js` |
| Kamus bobot (`WEIGHTS`) | Matriks bobot skor per soal dan per opsi ke jalur. | `src/data.js` |
| Kedaluwarsa (lamaran) | Lamaran `pending` yang melewati batas keputusan owner dan otomatis ditolak: `status: "rejected"`, `reason: "expired"`, label "DITOLAK OTOMATIS". Log: `autoReject`/`autoRejectWho`. Lamaran yang sudah diputuskan atau kedaluwarsa tidak dapat diputuskan lagi. | `expirePending` di `rules.js`; `deadline.*` |
| Kontak anggota | WA, email, LinkedIn, dan GitHub anggota tim yang hanya ditampilkan di ruang tim kepada owner dan anggota yang disetujui. Pada mode demo berupa data contoh (`contoh.id`). Dianggap data pribadi. | `ANGGOTA`, `BUILDER` di `data.js`; `TeamRoom.jsx` |
| Kota | Kota domisili peserta; wajib diisi. Pada rencana memakai `cityId` dari `/agent/regions`. Dianggap data pribadi. | `Identity.jsx`; [../brief.md](../brief.md) 5.1 |
| Kuis / Skenario | Enam pertanyaan situasi (mis. "Hari pertama", "Agent-mu ngarang") untuk menentukan jalur; tidak ada jawaban benar. | `questions` di `id.js`; `Quiz.jsx` |
| Lamaran | Permohonan peserta untuk masuk ke satu tim. Status: `pending` (menunggu), `approved` (disetujui), `rejected` (ditolak); pada rencana juga `withdrawn`. | `st.apps`; `rules.js` |
| Lamaran aktif | Lamaran berstatus `pending` atau `approved`. Satu orang hanya boleh punya satu pada satu waktu. | `activeApp` di `rules.js` |
| Latar | Latar belakang peserta saat ini (kerja tech, kerja non-tech, mahasiswa, freelance, founder, cari kerja). Tidak menentukan jalur. | `LATAR`; `identity.latar` |
| Linimasa (timeline) | Rangkaian tanggal penting: 15 Okt pendaftaran dibuka, 1 Nov batas pendaftaran dan karya, 14 Nov finalis, 27 Nov Demo Day. | `schedule`; `event.dates` |
| Login aiclub.id | Layar masuk. Saat ini dummy (email dan sandi bebas); rencana: login sungguhan memakai session aiclub.id. | `Login.jsx`; [../brief.md](../brief.md) bagian 4 |
| `memberId` | Identitas unik anggota aiclub.id; rencana menjadi kunci utama peserta di semua sistem (`hackathon_participant.member_id`). | [../brief.md](../brief.md) bagian 1 dan 5 |
| Mode draf (`modeDraft`) | Opsi `CONFIG.modeDraft`. Bila `true`, hanya jalur CEO yang boleh membuka tim. Nilai saat ini `false`. | `data.js`; `Result.jsx` |
| Override (jalur) | Koreksi jalur manual oleh peserta ("sistem bisa salah"); mengalahkan hasil skor. Pada rencana: `jalur_override`. | `st.override`; `aktif` |
| Owner | Peserta yang membuka dan memiliki satu tim; membuat grup WhatsApp tim, menyetujui atau menolak pelamar, mengundang builder, menutup tim. Tidak boleh sekaligus anggota tim lain. | `MyTeam.jsx`; `st.myTeam` |
| Pasar tim (`pasar`) | Layar daftar tim yang butuh peserta dan builder yang cari tim. Baru terbuka setelah gabung grup utama. | `Market.jsx` |
| Pelamar | Peserta yang melamar ke tim; tampil pada kotak "Pelamar masuk" milik owner. | `dash.myTeam.inbox` |
| Pelamar contoh (`SEED_APPLICANTS`) | Indeks `BUILDER` (0 dan 4: Dimas, Arif) yang otomatis menjadi pelamar pada tim buatan peserta di mode dummy. | `data.js` |
| Pengumuman | Informasi resmi panitia untuk semua peserta di layar `info`; dapat dibaca tanpa login. Pengumuman disematkan tampil paling atas, sisanya dari yang terbaru. Penanda BARU atau SUDAH DIBACA dan badge jumlah belum dibaca tampil di header dan navigasi bawah. | `Announcements.jsx`; `PENGUMUMAN`; `ann.*`, `announcements` |
| `PERSIST` | Daftar kunci state yang disimpan ke `localStorage` (`hk_state`). | `App.jsx` |
| Pilih jalan (`pilih`) | Layar pilihan eksklusif: gabung tim atau buat tim. | `Choose.jsx` |
| PM (jalur) | Kode jalur "Product / PM": memotong prioritas, tahu satu hal yang harus jadi dulu. | `roles.PM` |
| Portal Tencent | Situs pendaftaran tim dan pengumpulan karya milik Tencent. Diakses lewat short link `aiclub.id/l/...` (`TENCENT_REGISTER_URL`, `TENCENT_SUBMIT_URL`). | `data.js`; `README.md` |
| Project siap (`projectReady`) | Penanda bahwa peserta mencentang project sudah selesai; prasyarat tombol submit aktif. Pada rencana: `project_ready_at`. | `Submit.jsx` |
| R2 | Penyimpanan objek Cloudflare yang dipakai aiclub.id untuk file. Belum dipakai portal ini. | [../brief.md](../brief.md) bagian 3 |
| Rate limiting (rencana) | Pembatasan jumlah permintaan per waktu per session/IP untuk mencegah penyalahgunaan dan brute force. | [14_SECURITY_THREAT_MODEL.md](14_SECURITY_THREAT_MODEL.md) |
| Reject / Tolak | Keputusan owner menolak pelamar; status `rejected`. Peserta boleh melamar tim lain. | `App.jsx` |
| Ruang tim | Bagian halaman tim yang memuat anggota beserta kontak dan chat tim. Terbuka bagi owner (di dasbor) dan pelamar yang disetujui (di detail tim); terkunci bagi pelamar yang belum disetujui atau ditolak. | `TeamRoom.jsx`; `src/lib/team.js`; `room.*` |
| Satu orang satu tim | Aturan: seseorang anggota satu tim atau owner satu tim, tidak keduanya. Saat ini dijaga di klien (`rules.js`); rencana dijaga server. | `README.md`; `rules.js` |
| Short link | Tautan pendek aiclub.id berbentuk `aiclub.id/l/...`. | `data.js` |
| `skor()` | Fungsi penghitung skor jalur dari jawaban; hasil resmi rencananya dihitung ulang server. | `src/lib/scoring.js` |
| Slot | Peran yang dicari sebuah tim (`butuh`), berupa kode jalur. | `TIM[].butuh`; `market.slots` |
| Stepper / Langkah besar | Tiga langkah utama: 0 daftar di portal kita, 1 daftar tim ke Tencent, 2 submit project. Dikelola `STEP_OF` dan `gotoStep`. | `Chrome.jsx`; `data.js` |
| Sub-langkah | Indikator kecil di langkah 0: Data, Skenario, Jalur, Grup utama, Tim, Status. | `Widgets.jsx`; `sub.*` |
| Submit | Langkah 3: mengirim project ke Tencent melalui `TENCENT_SUBMIT_URL`. Hanya dikerjakan setelah project selesai. | `Submit.jsx` |
| Tantangan | Tiga pilihan tema: The Workplace Brain (Learn Anywhere), The Office Agent (Automate Better), The Creator Agent (Create Bolder). Peserta memilih satu. | `event.challenges` |
| Tarik lamaran (withdraw) | Peserta membatalkan lamaran `pending` miliknya. | `toggleApply`, `withdrawAll` |
| Tayangan (pengumuman) | Jumlah akun yang telah membuka sebuah pengumuman; satu akun dihitung satu kali. Mode demo: angka contoh (`PENGUMUMAN[].views`) ditambah 1 bila akun di perangkat ini sudah membuka (`annViewed`). Rencana: dihitung di server. | `annViews` di `Announcements.jsx` |
| Tencent | Tencent Cloud Indonesia, mitra penyelenggara event dan pemberi tantangan. | `intro.sub`; `event.collab` |
| Tim contoh (`TIM`) | Enam tim dummy (REKON, WARUNG TAP, SIAP RISIKO, TANYA OPS, ANTRE HABIS, BACA KONTRAK). Tautan `wa` hanyalah placeholder. | `src/data.js` |
| Toast | Pesan singkat 2,2 detik di bawah layar (`role="status"`). | `App.jsx` |
| Tutup tim | Tindakan owner membubarkan tim agar dapat melamar ke tim lain. Rencana: status `closed`. | `closeTeam`; `choose.closeTeam` |
| Undangan | Owner mengundang builder ke timnya. Saat ini hanya penanda di state klien (`undang`); rencana: tabel `hackathon_invite`. | `toggleInvite` |
| Vite | Alat build dan server dev. Versi `^5.4.11`. | `package.json` |
| `VITE_API_BASE`, `VITE_LOGIN_URL` (rencana) | Variabel lingkungan untuk alamat API dan halaman login; tidak boleh berisi rahasia. | [../brief.md](../brief.md) 7 |
| WA_LINK_RE | Ekspresi reguler validasi tautan grup WhatsApp: `^https://chat.whatsapp.com/[A-Za-z0-9_-]+`. | `src/data.js` |
| `waValid` | Validasi nomor WhatsApp: 9 sampai 15 digit setelah karakter non-angka dibuang. | `src/lib/scoring.js` |
| WhatsApp (WA) | Kanal grup utama dan grup tim; nomor WA peserta adalah data pribadi wajib. | `Group.jsx` |
| WorkBuddy | Alat yang dipakai membangun karya Agentic AI pada event; logonya tampil bersama CodeBuddy dan SumoPod sebagai mitra. | `schedule`; `public/brand/` |
