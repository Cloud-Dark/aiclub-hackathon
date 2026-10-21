# Standard Kode

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

## 1. Tujuan dan Lingkup

Standard ini mengatur gaya penulisan kode di `src/` (React 18 + Vite 5, JavaScript tanpa TypeScript) agar konsisten dengan praktik yang sudah dipakai. Aturan batas lapisan dan integrasi API ada di [03_ARCHITECTURE_STANDARD.md](03_ARCHITECTURE_STANDARD.md); aturan keamanan di [04_SECURITY_STANDARD.md](04_SECURITY_STANDARD.md).

Linter dan formatter belum terpasang (_TBD_). Sampai terpasang, standard ini ditegakkan lewat review PR ([01_CONTRIBUTION_STANDARD.md](01_CONTRIBUTION_STANDARD.md)).

## 2. Struktur Berkas

```
src/
  main.jsx          titik masuk: createRoot(...).render(<App />)
  App.jsx           state global (satu useState), navigasi layar, kumpulan actions
  data.js           konstanta dan data contoh (CONFIG, URUT, WEIGHTS, TIM, URL)
  styles.css        satu-satunya berkas CSS
  components/       satu komponen layar atau satu kelompok widget per berkas
  lib/              fungsi murni (aturan, skor, waktu), tanpa React
  i18n/             id.js, en.js, zh.js, index.js (makeT, detectLang)
```

| Aturan | Tingkat |
|---|---|
| Komponen layar tinggal di `src/components/<NamaLayar>.jsx` dan diekspor `default` | WAJIB |
| Widget kecil bersama diekspor bernama dari berkas kelompok (`Common.jsx`, `Widgets.jsx`, `Brand.jsx`, `Chrome.jsx`) | WAJIB |
| Fungsi murni tanpa JSX dan tanpa hook tinggal di `src/lib/*.js` | WAJIB |
| Berkas `lib/` mengimpor React atau menyentuh DOM | DILARANG |
| Berkas `lib/` menyentuh `localStorage` | DILARANG (pengecualian: `i18n/index.js` untuk preferensi bahasa) |
| Komponen mengimpor komponen layar lain | DILARANG; navigasi lewat `go()` dan `actions` dari `App.jsx` |
| Berkas komponen lebih dari sekitar 150 baris | DISARANKAN dipecah menjadi widget |
| Ekstensi eksplisit pada impor relatif (`"./lib/rules.js"`, `"./components/Quiz.jsx"`) | WAJIB |

## 3. Komponen React

1. Komponen WAJIB berupa fungsi (`function` atau `export default function`). Class component DILARANG.
2. Impor `React` WAJIB ada pada berkas yang berisi JSX (praktik berkas yang ada: `import React from "react"`).
3. Hook hanya dipanggil di level atas komponen. State lokal (`useState`) DISARANKAN hanya untuk nilai tampilan sementara (input yang belum disimpan, status "sudah disimpan"); state yang memengaruhi alur bisnis hidup di `App.jsx`.
4. Efek samping (`useEffect`) WAJIB membersihkan dirinya (listener, timer), seperti `ConfirmButton` pada `Widgets.jsx` yang membersihkan `setTimeout`.
5. Tombol WAJIB memakai `type="button"` kecuali tombol submit formulir. Tombol yang terkunci memakai `aria-disabled="true"` (bukan `disabled`) agar tetap bisa difokus dan memberi umpan balik.
6. Tautan eksternal WAJIB memakai `target="_blank" rel="noopener noreferrer"`.
7. Elemen dalam daftar WAJIB punya `key` yang stabil (`key={tm.nama}`), bukan indeks, bila data bisa berubah urutan.
8. Ikon dekoratif WAJIB `aria-hidden="true"`; gambar dekoratif `alt=""`.
9. `dangerouslySetInnerHTML` DILARANG (lihat [04_SECURITY_STANDARD.md](04_SECURITY_STANDARD.md)).
10. Props umum layar adalah `{ st, patch, t, get, role, onNext, onBack, actions }`. Komponen baru DISARANKAN memakai pola yang sama dan hanya mengambil props yang dipakai.

Contoh benar:

```jsx
export default function Submit({ st, patch, t, onBack, actions }) {
  const ready = !!st.projectReady;
  return (
    <section className="screen">
      <h2>{t("submit.title")}</h2>
      <button type="button" className="btn gold" aria-disabled={!ready}>{t("submit.cta")}</button>
    </section>
  );
}
```

Contoh salah:

```jsx
class Submit extends React.Component { /* DILARANG: class component */ }

<button onClick={go}>Kirim project</button>   {/* tanpa type, teks keras */}
<a href={url} target="_blank">Buka</a>          {/* tanpa rel="noopener noreferrer" */}
```

## 4. Penamaan

| Objek | Konvensi | Contoh dari kode |
|---|---|---|
| Berkas komponen | `PascalCase.jsx` | `TeamDetail.jsx`, `MyTeam.jsx` |
| Berkas lib, data, i18n | `lowercase.js` | `rules.js`, `scoring.js`, `time.js` |
| Komponen, widget | `PascalCase` | `ConfirmButton`, `SubSteps` |
| Fungsi, variabel, props | `camelCase` | `canApply`, `activeApp`, `onNext` |
| Konstanta modul | `UPPER_SNAKE_CASE` | `TENCENT_REGISTER_URL`, `WA_LINK_RE`, `DUMMY_USERS` |
| Konstanta tabel ringkas | `UPPER_CASE` | `URUT`, `WEIGHTS`, `LATAR`, `TIM` |
| Kunci layar | kata Indonesia huruf kecil | `identitas`, `kuis`, `hasil`, `grup`, `pilih`, `pasar`, `buat`, `dasbor` |
| Kelas CSS | huruf kecil, singkat, tanda hubung | `.card`, `.btn`, `.head-back`, `.cta-link` |
| `localStorage` | awalan `hk_` | `hk_state`, `hk_lang` |
| Prop bertipe fungsi | awalan `on` (pemanggil) atau kata kerja (anggota `actions`) | `onBack`, `actions.toggleApply` |
| Fungsi predikat | awalan `can`, `is`, atau akhiran `Done`/`Valid` | `canCreate`, `quizDone`, `waValid` |

Nama yang disingkat tanpa arti jelas (`x`, `tmp`, `d`) DISARANKAN dihindari kecuali sebagai parameter lambda pendek (`(x) => x.team === team`).

## 5. Bahasa Indonesia untuk Kunci Data

Model data domain memakai kunci Indonesia. Kunci ini terikat pada tampilan, `localStorage`, dan rencana skema database ([../../brief.md](../../brief.md) bagian 5), sehingga WAJIB konsisten.

| Konsep | Kunci yang dipakai | Catatan |
|---|---|---|
| Nama peserta, tim | `nama` | Bukan `name` |
| Kota | `kota` | |
| Jawaban skenario | `jawab` (larik indeks) | Bukan `answers` |
| Jalur terpilih | `override`; hasil skor `aktif(st)` | |
| Anggota, kebutuhan peran | `anggota`, `butuh` | |
| Rentang waktu, jumlah grup | `hari`, `grupN` | |
| Link grup WhatsApp | `wa` | Di klien bernama `wa`; di server/DB diusulkan `wa_link` ([../../brief.md](../../brief.md) bagian 5.2). Pemetaan dilakukan di lapisan API |
| Peran/jalur | `CEO`, `CTO`, `AI`, `PM`, `DSG`, `GRW`, `DOM`, `DAT` | Kode tetap, tidak diterjemahkan |
| Status lamaran | `pending`, `approved`, `rejected` | Nilai enum tetap berbahasa Inggris; sesuai kontrak server |

Aturan:

1. Kunci data domain baru WAJIB berbahasa Indonesia mengikuti tabel di atas.
2. Nilai enum yang akan dipertukarkan dengan server (`status`) WAJIB berbahasa Inggris huruf kecil dan identik dengan kontrak di [03_ARCHITECTURE_STANDARD.md](03_ARCHITECTURE_STANDARD.md).
3. Kunci teknis non-domain (`user`, `screen`, `mode`, `tab`, `idx`, `lang`) tetap berbahasa Inggris dan DILARANG dicampur menjadi singkatan Indonesia.
4. Mengganti nama kunci yang tersimpan di `hk_state` WAJIB disertai penanganan data lama (nilai yang tidak dikenal diabaikan) dan dicatat pada changelog.
5. Komentar kode berbahasa Indonesia, huruf kecil di awal, menjelaskan alasan, bukan mengulang kode (contoh: `// satu orang: jadi anggota satu tim ATAU owner satu tim, tidak keduanya.`).

## 6. Internasionalisasi (i18n)

Bahasa yang didukung: `id` (default dan cadangan), `en`, `zh`. Kamus: `src/i18n/id.js`, `en.js`, `zh.js`, diakses lewat `makeT(lang)` yang mengembalikan `{ t, get, role }`.

| Fungsi | Dipakai untuk | Contoh |
|---|---|---|
| `t("jalur.kunci", vars)` | Semua teks tampilan bertipe string; mendukung sisipan `{nama}` | `t("market.members", { n: tm.anggota })` |
| `get("jalur")` | Mengambil larik atau objek (bukan string) | `get("questions")[st.idx]`, `get("teams")[i]` |
| `role(kode)` | Pintasan ke `get("roles." + kode)` | `role(a).ringkas` |

Aturan:

1. Semua teks yang dilihat pengguna WAJIB lewat `t()` atau `get()`. String keras di JSX DILARANG, kecuali nama merek dan penanda dekoratif (misalnya `TENCENT CLOUD`, `&rsaquo;`).
2. Kunci baru WAJIB ditambahkan ke ketiga berkas (`id.js`, `en.js`, `zh.js`) dengan struktur identik pada PR yang sama. Fallback ke `id` hanya jaring pengaman, bukan alasan melewatkan terjemahan.
3. Penamaan kunci: `bagian.namaKunci` dalam camelCase bahasa Inggris atau istilah layar yang sudah ada (`identity.errName`, `market.stApproved`, `dash.myTeam.title`). Awalan `err` untuk pesan galat, `Ph` untuk placeholder, `Hint` untuk petunjuk.
4. Sisipan variabel WAJIB memakai `{nama}`, bukan penggabungan string.

Contoh benar:

```jsx
<span>{t("market.members", { n: tm.anggota })}</span>
```

Contoh salah:

```jsx
<span>{tm.anggota + " anggota"}</span>        {/* teks keras, tidak bisa diterjemahkan */}
<span>{t("market.members") + tm.anggota}</span> {/* sisipan lewat penggabungan */}
```

5. Format tanggal dan jam WAJIB lewat `fmtTime(ms, lang)` pada `src/lib/time.js` agar mengikuti lokal (`id-ID`, `en-US`, `zh-CN`).
6. Pemilihan bahasa awal mengikuti `detectLang()`: parameter `?lang=`, lalu `localStorage` `hk_lang`, lalu bahasa peramban; cadangan akhir `en`. Perilaku ini DILARANG diubah tanpa mengubah standard ini.
7. Tampilan baru WAJIB diperiksa pada tiga bahasa. Panjang teks `en` dan `zh` berbeda dari `id`; layout tidak boleh pecah. Aturan khusus `html[lang=zh]` ada di `styles.css`.
8. Pengaturan `document.documentElement.lang` dan `document.title` dilakukan di `App.jsx` dari kunci `meta.lang` dan `meta.title`; kunci ini WAJIB ada di setiap bahasa.

## 7. CSS

1. Gaya WAJIB ditulis di `src/styles.css`. Menambah berkas CSS baru, CSS-in-JS, atau pustaka UI DILARANG tanpa keputusan tertulis.
2. Warna, font, dan ukuran berulang WAJIB memakai variabel pada `:root` (`--bg`, `--ink`, `--cyan`, `--yellow`, `--magenta`, `--pixel`, `--mono`, `--sans`, `--gut`). Menulis nilai heksadesimal baru di aturan komponen DILARANG bila padanannya sudah ada sebagai variabel.
3. Kelas bersifat global dan singkat; nama baru WAJIB dicek agar tidak bertabrakan (`grep` pada `styles.css`).
4. Gaya inline (`style={{ ... }}`) hanya untuk penyesuaian sekali pakai pada layout (`maxWidth`, `marginBottom`). Gaya yang dipakai dua kali atau lebih WAJIB dipindah menjadi kelas.
5. Tata letak WAJIB responsif (mobile dulu, `@media (min-width: ...)` untuk layar besar) dan tidak menimbulkan scroll horizontal.
6. Animasi WAJIB menghormati `prefers-reduced-motion` (lihat `go()` pada `App.jsx` yang memilih `behavior: "auto"`).
7. Fokus keyboard WAJIB terlihat (`:focus-visible` sudah didefinisikan global); DILARANG `outline: none` tanpa pengganti.
8. Aset merek WAJIB dirujuk lewat `asset("nama.png")` pada `Brand.jsx` (memakai `import.meta.env.BASE_URL`), bukan jalur absolut `/brand/...`, supaya jalan pada sub-path GitHub Pages.

## 8. Aksesibilitas dan Perilaku Umum

- Perpindahan layar memindahkan fokus ke `h1`/`h2` pertama dan `main#app` memakai `aria-live="polite"`; layar baru WAJIB memiliki judul `h2`.
- Formulir WAJIB memakai `<label>` yang membungkus input, `aria-invalid` pada galat, dan pesan galat tampil di dekat bidang.
- Aksi yang tidak bisa dibatalkan WAJIB memakai `ConfirmButton` (konfirmasi dua klik).
- Akses `localStorage` WAJIB dibungkus `try/catch` dan aplikasi harus tetap jalan bila gagal.
- Pintasan keyboard global WAJIB mengabaikan fokus pada `input/select/textarea` dan kombinasi Ctrl/Meta/Alt.

## 9. Pola yang Dilarang

| Pola | Alasan |
|---|---|
| `console.log` tertinggal di kode rilis | Bocor informasi, bising |
| Menyimpan rahasia atau token di kode atau `.env` berawalan `VITE_` | Masuk ke bundel; lihat [04_SECURITY_STANDARD.md](04_SECURITY_STANDARD.md) |
| Memutuskan aturan bisnis hanya di komponen | Harus di `lib/` dan (setelah integrasi) di server |
| Menyalin logika `rules.js` ke komponen | Duplikasi; panggil fungsi `lib/` |
| Mengubah `st` secara langsung (`st.apps.push(...)`) | State WAJIB diubah lewat `patch`, `update`, atau `setSt` |
| `// eslint-disable` atau `@ts-ignore` tanpa alasan | Menyembunyikan masalah |
| Kode mati dan blok komentar kode | Gunakan riwayat git |

## 10. Riwayat Dokumen

| Tanggal | Perubahan |
|---|---|
| 2026-10-21 | Draf awal berdasarkan kode yang ada. |
