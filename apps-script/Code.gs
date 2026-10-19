/**
 * 🧩 AI Agent Hackathon — Penampung Data Pendaftaran
 * ------------------------------------------------------------
 * Menerima data dari form pendaftaran lewat doPost(e) dan menyimpannya
 * rapi ke Google Sheets dalam 2 tab:
 *   👥 Peserta  → 1 baris per peserta (di-update, bukan ditumpuk)
 *   🗂️ Log      → catatan setiap request masuk (buat debugging)
 *
 * Cara pakai singkat:
 *   1. Buat Google Sheet baru → Extensions → Apps Script → tempel file ini.
 *      (Script harus dibuat dari dalam Sheet; spreadsheet aktif dipakai otomatis.)
 *   2. Jalankan fungsi `setup` sekali (izinkan akses).
 *   3. Deploy → New deployment → Web app
 *        Execute as: Me   |   Who has access: Anyone
 *   4. Salin URL /exec ke file .env aplikasi: VITE_GAS_URL=...
 *
 * Payload JSON yang dikirim aplikasi (flat, semua opsional kecuali nama di kiriman pertama):
 * {
 *   "id": "HK-AB12CD",            // dari respons sebelumnya; kosong = peserta baru
 *   "event": "selesai",           // identitas | kuis | hasil | selesai | update
 *   "nama": "Raka", "kota": "Kupang", "email": "raka@mail.com",
 *   "wa": "+62812...", "linkedin": "https://linkedin.com/in/...",   // opsional
 *   "latar": "kerja-tech",        // kerja-tech | kerja-nontech | mahasiswa | freelance | founder | cari-kerja
 *   "lang": "id",                 // id | en | zh
 *   "jawab": [0, 2, 1, 3, 0, 4],  // index opsi per skenario (null = belum dijawab)
 *   "override": "CTO",            // koreksi jalur oleh peserta (kosong = ikut deteksi)
 *   "token": "..."                // hanya jika CONFIG.TOKEN diisi
 * }
 * Field yang tidak dikirim tidak akan menimpa data lama (partial update).
 * Skor & jalur dihitung ulang di server dari jawaban, jadi tidak bisa dimanipulasi dari browser.
 */

// ============================================================
// ⚙️ KONFIGURASI
// ============================================================
const CONFIG = {
  TOKEN: '',               // opsional: isi string rahasia, lalu kirim "token" yang sama dari form
  TZ: 'Asia/Jakarta',
  QUIZ_LEN: 6
};

const SH = {
  PESERTA: '👥 Peserta',
  LOG: '🗂️ Log'
};

// Palet lembut (pastel) — cukup untuk membedakan kelompok kolom
const C = {
  text: '#3C4043',
  muted: '#9AA0A6',
  line: '#DADCE0',
  zebra: '#FAFAFB',
  meta: '#F1F3F4',      // abu
  identity: '#E8F0FE',  // biru muda
  quiz: '#F3E8FD',      // lavender
  result: '#FEF7E0',    // kuning muda
  score: '#E6F4EA'      // hijau muda
};

// ============================================================
// 📚 DATA REFERENSI (sama dengan form)
// ============================================================
const ROLE = {
  CEO: 'CEO / Pemilik ide',
  CTO: 'CTO / Engineer',
  AI:  'AI / Agent engineer',
  PM:  'Product / PM',
  DSG: 'Designer',
  GRW: 'Growth / Marketing',
  DOM: 'Domain expert (ops, risk, finance)',
  DAT: 'Data analyst'
};
const ROLE_KEYS = Object.keys(ROLE);

const LATAR = {
  'kerja-tech': 'Kerja di perusahaan teknologi',
  'kerja-nontech': 'Kerja di perusahaan non-teknologi',
  'mahasiswa': 'Mahasiswa / pelajar',
  'freelance': 'Freelance / kontraktor',
  'founder': 'Sedang bangun usaha sendiri',
  'cari-kerja': 'Sedang cari kerja'
};

const LANG = { id: 'ID', en: 'EN', zh: '中文' };

const WEIGHTS = [
  [{DOM:3,PM:1},{PM:3,AI:1},{CTO:3,AI:1},{CEO:3},{DAT:3}],
  [{DSG:3},{CTO:2,AI:1},{PM:2,DSG:2},{CEO:2,GRW:2}],
  [{AI:3,CTO:1},{AI:2,DAT:2},{PM:2,CEO:1},{DOM:3}],
  [{CTO:2,CEO:1},{CEO:3},{PM:3},{GRW:2,DSG:1}],
  [{CEO:3,GRW:1},{CTO:2,AI:1},{DAT:2,DOM:2},{DSG:2,PM:1,GRW:1}],
  [{CEO:3},{CTO:2,AI:1},{DOM:3},{GRW:3},{DAT:2,AI:1}]
];

const QUESTIONS = [
  { judul: 'Hari pertama', opsi: [
    'Telepon dua orang yang tiap malam ngerjain itu, tanya alurnya dari awal',
    'Gambar dulu alur agent-nya — langkah, input, di mana dia boleh memutuskan',
    'Buka editor, coba panggil API-nya, lihat mana yang sebenarnya bisa dipakai',
    'Tentukan siapa ngerjain apa dan apa yang harus jadi akhir minggu ini',
    'Tarik datanya dulu, hitung berapa transaksi yang gagal cocok tiap hari' ] },
  { judul: 'Prototipe jalan, tapi jelek', opsi: [
    'Rapikan alurnya: buang dua langkah, satu tombol utama yang jelas',
    'Biarkan. Yang dinilai juri fungsinya, dan itu sudah benar',
    'Tanya tiga calon pengguna, mana yang paling bikin berhenti',
    'Tulis skrip demo yang rapi supaya alurnya terbaca sebagai cerita' ] },
  { judul: 'Agent-mu ngarang', opsi: [
    'Ganti ke tool-calling, kurangi ruang dia menebak sendiri',
    'Bikin evaluasi otomatis dulu, ukur di 100 kasus, baru perbaiki',
    'Sempitkan wewenangnya: satu pekerjaan saja yang boleh dia urus',
    'Pasang jalur eskalasi ke manusia — di kerjaan ini salah itu mahal' ] },
  { judul: 'Satu orang hilang', opsi: [
    'Aku ambil alih bagiannya, malam ini juga',
    'Buka slot itu lagi di pasar tim, rekrut hari ini',
    'Potong fitur yang dia pegang, kunci ruang lingkupnya',
    'Ubah cerita demonya supaya bagian itu tidak diperlukan' ] },
  { judul: 'Lima menit di depan juri', opsi: [
    'Masalahnya milik siapa, berapa besar ruginya, kenapa harus kami',
    'Live demo, satu alur penuh, tanpa slide',
    'Sebelum dan sesudah: dulu 40 menit per hari, sekarang dua menit',
    'Satu pengguna, satu hari kerjanya, dari macet sampai selesai' ] },
  { judul: 'Setelah hackathon', opsi: [
    'Jadi usaha. Aku cari cofounder dan pengguna pertama',
    'Aku open source-kan, biar orang lain bisa pakai dan lanjutkan',
    'Aku pasang di kantorku sendiri — masalahnya memang masalah kami',
    'Aku urus distribusinya. Karya bagus tanpa pengguna sama dengan nol',
    'Aku mau tahu kenapa dia jalan atau gagal, lalu tulis temuannya' ] }
];
const KEYS = ['A', 'B', 'C', 'D', 'E'];

const STATUS = {
  daftar: '📝 Terdaftar',
  jalur: '🎯 Dapat Jalur',
  selesai: '✅ Selesai (WA)'
};

// ============================================================
// 🧱 STRUKTUR KOLOM
// ============================================================
const COLS_PESERTA = [
  { key: 'id',       label: '🆔 ID',                group: 'meta',     width: 100, align: 'center' },
  { key: 'created',  label: '🕒 Daftar',            group: 'meta',     width: 135, fmt: 'dd MMM yyyy, HH:mm' },
  { key: 'updated',  label: '🔄 Update Terakhir',   group: 'meta',     width: 135, fmt: 'dd MMM yyyy, HH:mm' },
  { key: 'status',   label: '📌 Status',            group: 'meta',     width: 130, align: 'center' },
  { key: 'nama',     label: '👤 Nama',              group: 'identity', width: 150 },
  { key: 'kota',     label: '📍 Kota',              group: 'identity', width: 110 },
  { key: 'email',    label: '✉️ Email',             group: 'identity', width: 190 },
  { key: 'wa',       label: '💬 WhatsApp',          group: 'identity', width: 130, fmt: '@' },
  { key: 'linkedin', label: '🔗 LinkedIn',          group: 'identity', width: 200 },
  { key: 'latar',    label: '💼 Latar',             group: 'identity', width: 200 },
  { key: 'lang',     label: '🌐 Bahasa',            group: 'identity', width: 75,  align: 'center' }
]
  .concat(QUESTIONS.map((q, i) => ({
    key: 's' + (i + 1),
    label: '🧩 S' + (i + 1) + ' · ' + q.judul,
    group: 'quiz', width: 210,
    note: q.opsi.map((o, j) => KEYS[j] + '. ' + o).join('\n')
  })))
  .concat([
    { key: 'detected', label: '🎯 Jalur Terdeteksi',  group: 'result', width: 165 },
    { key: 'second',   label: '🥈 Jalur Kedua',       group: 'result', width: 165 },
    { key: 'override', label: '✏️ Koreksi Peserta',   group: 'result', width: 165 },
    { key: 'final',    label: '✅ Jalur Final',       group: 'result', width: 165 }
  ])
  .concat(ROLE_KEYS.map(k => ({
    key: 'sc_' + k, label: k, group: 'score', width: 52, align: 'center', note: 'Skor ' + ROLE[k]
  })))
  .concat([
    { key: 'raw',     label: '_state',                 group: 'meta',   width: 80, hidden: true }
  ]);

const COLS_LOG = [
  { key: 'time',    label: '🕒 Waktu',   group: 'meta', width: 135, fmt: 'dd MMM yyyy, HH:mm:ss' },
  { key: 'event',   label: '📡 Event',   group: 'meta', width: 100, align: 'center' },
  { key: 'id',      label: '🆔 ID',      group: 'meta', width: 100, align: 'center' },
  { key: 'hasil',   label: '✅ Hasil',   group: 'meta', width: 220 },
  { key: 'payload', label: '📦 Payload', group: 'meta', width: 420 }
];

const COL = indexOf_(COLS_PESERTA);

// ============================================================
// 🌐 ENDPOINT
// ============================================================
function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return json_({ ok: false, error: 'Server sedang sibuk, coba lagi sebentar.' });

  let ss, data = {};
  try {
    ss = ss_();
    ensureSetup_(ss, false);
    data = parse_(e);

    if (CONFIG.TOKEN && data.token !== CONFIG.TOKEN) throw new Error('Token tidak valid');

    const clean = clean_(data);
    const res = upsert_(ss, clean);
    log_(ss, clean.event, res.id, '✅ OK' + (res.isNew ? ' · peserta baru' : ''), data);
    return json_(Object.assign({ ok: true }, res));
  } catch (err) {
    const msg = String(err && err.message || err);
    try { if (ss) log_(ss, data.event || '-', data.id || '-', '⚠️ Gagal: ' + msg, data); } catch (_) {}
    return json_({ ok: false, error: msg });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, service: 'AI Agent Hackathon — pendaftaran', time: new Date().toISOString() });
}

// ============================================================
// 💾 SIMPAN / UPDATE PESERTA
// ============================================================
function upsert_(ss, d) {
  const sh = ss.getSheetByName(SH.PESERTA);
  const width = COLS_PESERTA.length;

  let row = d.id ? findRow_(sh, COL.id, d.id) : 0;
  if (!row && d.email) row = findRow_(sh, COL.email, d.email);
  const isNew = !row;

  let prev = {}, prevState = {};
  if (!isNew) {
    const vals = sh.getRange(row, 1, 1, width).getValues()[0];
    COLS_PESERTA.forEach((c, i) => prev[c.key] = vals[i]);
    try { prevState = JSON.parse(prev.raw || '{}'); } catch (_) { prevState = {}; }
  }

  const state = Object.assign(
    { nama: '', kota: '', email: '', wa: '', linkedin: '', latar: '', lang: 'id', jawab: [], override: '', selesai: false },
    prevState
  );
  ['nama', 'kota', 'email', 'wa', 'linkedin', 'latar', 'lang', 'jawab', 'override']
    .forEach(k => { if (k in d) state[k] = d[k]; });
  if (d.event === 'selesai') state.selesai = true;

  if (!state.nama) throw new Error('Nama wajib diisi');
  if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) throw new Error('Format email belum benar');

  const id = prev.id || d.id || newId_();
  const now = new Date();

  // Hitung skor & jalur di server
  const sc = score_(state.jawab);
  const order = ROLE_KEYS.slice().sort((a, b) => sc[b] - sc[a]);
  const done = quizDone_(state.jawab);
  const answered = state.jawab.some(v => v != null);
  const detected = done ? order[0] : '';
  const final = done ? (state.override || detected) : '';
  const second = done ? order.filter(k => k !== final)[0] : '';

  const status = state.selesai ? STATUS.selesai : done ? STATUS.jalur : STATUS.daftar;

  const obj = {
    id: id,
    created: prev.created || now,
    updated: now,
    status: status,
    nama: state.nama,
    kota: state.kota,
    email: state.email,
    wa: state.wa,
    linkedin: state.linkedin,
    latar: LATAR[state.latar] || '',
    lang: LANG[state.lang] || '',
    detected: detected ? ROLE[detected] : '',
    second: second ? ROLE[second] : '',
    override: state.override ? ROLE[state.override] : '',
    final: final ? ROLE[final] : '',
    raw: JSON.stringify(state)
  };
  QUESTIONS.forEach((q, i) => {
    const n = state.jawab[i];
    obj['s' + (i + 1)] = n == null ? '' : KEYS[n] + ' · ' + q.opsi[n];
  });
  ROLE_KEYS.forEach(k => obj['sc_' + k] = answered ? sc[k] : '');

  if (isNew) {
    row = Math.max(sh.getLastRow(), 1) + 1;
    if (row > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), 50);
  }
  sh.getRange(row, 1, 1, width).setValues([COLS_PESERTA.map(c => obj[c.key] == null ? '' : obj[c.key])]);

  return {
    id: id,
    isNew: isNew,
    row: row,
    status: status,
    jalur: final || null,
    jalurNama: final ? ROLE[final] : null
  };
}

// ============================================================
// 🧹 VALIDASI & NORMALISASI INPUT
// ============================================================
function parse_(e) {
  let d = {};
  const raw = e && e.postData && e.postData.contents;
  if (raw) { try { d = JSON.parse(raw); } catch (_) { d = {}; } }
  if (!d || typeof d !== 'object' || Array.isArray(d)) d = {};
  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(k => { if (!(k in d)) d[k] = e.parameter[k]; });
  }
  return d;
}

function clean_(d) {
  const has = k => Object.prototype.hasOwnProperty.call(d, k) && d[k] !== null && d[k] !== undefined;
  const out = {
    id: has('id') ? String(d.id).trim().slice(0, 40) : '',
    event: has('event') ? String(d.event).trim().slice(0, 30) : 'update'
  };
  if (has('nama'))  out.nama  = str_(d.nama, 80);
  if (has('kota'))  out.kota  = str_(d.kota, 60);
  if (has('email')) out.email = str_(d.email, 120).toLowerCase();
  if (has('wa'))       out.wa       = phone_(d.wa);
  if (has('linkedin')) out.linkedin = str_(d.linkedin, 200);
  if (has('latar') && LATAR[d.latar]) out.latar = d.latar;
  if (has('lang') && LANG[d.lang]) out.lang = d.lang;

  if (has('jawab')) {
    const list = Array.isArray(d.jawab) ? d.jawab : String(d.jawab).split(',');
    out.jawab = QUESTIONS.slice(0, CONFIG.QUIZ_LEN).map((q, i) => {
      const v = list[i];
      if (v === '' || v == null) return null;
      const n = Number(v);
      return Number.isInteger(n) && n >= 0 && n < q.opsi.length ? n : null;
    });
  }

  if (has('override')) out.override = ROLE[d.override] ? d.override : '';
  return out;
}

function phone_(v) { return String(v).replace(/[^\d+\-\s()]/g, '').trim().slice(0, 25); }
function str_(v, max) {
  let s = String(v).replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // cegah formula injection di Sheets
  return s;
}
// ============================================================
// 🧮 LOGIKA SKOR (identik dengan form)
// ============================================================
function score_(jawab) {
  const s = {};
  ROLE_KEYS.forEach(k => s[k] = 0);
  (jawab || []).forEach((p, i) => {
    const w = WEIGHTS[i] && p != null && WEIGHTS[i][p];
    if (w) Object.keys(w).forEach(k => s[k] += w[k]);
  });
  return s;
}
function quizDone_(jawab) {
  for (let i = 0; i < CONFIG.QUIZ_LEN; i++) if (!jawab || jawab[i] == null) return false;
  return true;
}
// ============================================================
// 🎨 SETUP & TAMPILAN SHEET
// ============================================================
function setup() {
  const ss = ss_();
  ss.setSpreadsheetTimeZone(CONFIG.TZ);
  ensureSetup_(ss, true);

  // hapus sheet bawaan yang masih kosong
  ['Sheet1', 'Sheet 1', 'Lembar1', 'Lembar 1'].forEach(n => {
    const s = ss.getSheetByName(n);
    if (s && s.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s);
  });
  ss.setActiveSheet(ss.getSheetByName(SH.PESERTA));
  ss.toast('Sheet siap menerima pendaftaran ✨', 'Hackathon', 4);
}

function ensureSetup_(ss, force) {
  buildSheet_(ss, SH.PESERTA, COLS_PESERTA, force, {
    freezeCols: COL.nama,
    rules: sh => {
      const n = sh.getMaxRows() - 1;
      const status = sh.getRange(2, COL.status, n, 1);
      const final = sh.getRange(2, COL.final, n, 1);
      const scores = sh.getRange(2, COL['sc_' + ROLE_KEYS[0]], n, ROLE_KEYS.length);
      return [
        rule_(status, 'Selesai', '#E6F4EA', '#137333'),
        rule_(status, 'Jalur', '#FEF7E0', '#7A5900'),
        rule_(status, 'Terdaftar', '#E8F0FE', '#174EA6'),
        SpreadsheetApp.newConditionalFormatRule().whenCellNotEmpty()
          .setBackground(C.result).setBold(true).setRanges([final]).build(),
        SpreadsheetApp.newConditionalFormatRule()
          .setGradientMinpointWithValue('#FFFFFF', SpreadsheetApp.InterpolationType.NUMBER, '0')
          .setGradientMaxpointWithValue('#B7E1CD', SpreadsheetApp.InterpolationType.MAX, '')
          .setRanges([scores]).build()
      ];
    }
  });

  buildSheet_(ss, SH.LOG, COLS_LOG, force, {
    freezeCols: 0,
    rules: sh => {
      const hasil = sh.getRange(2, 4, sh.getMaxRows() - 1, 1);
      return [
        rule_(hasil, 'OK', '#E6F4EA', '#137333'),
        rule_(hasil, 'Gagal', '#FCE8E6', '#8C1D18')
      ];
    }
  });
}

function buildSheet_(ss, name, cols, force, opts) {
  let sh = ss.getSheetByName(name);
  if (sh && !force) return sh;

  const fresh = !sh;
  if (fresh) sh = ss.insertSheet(name);
  const n = cols.length;

  if (sh.getMaxColumns() < n) sh.insertColumnsAfter(sh.getMaxColumns(), n - sh.getMaxColumns());
  if (fresh && sh.getMaxColumns() > n) sh.deleteColumns(n + 1, sh.getMaxColumns() - n);
  if (sh.getMaxRows() < 200) sh.insertRowsAfter(sh.getMaxRows(), 200 - sh.getMaxRows());

  // Header
  const hdr = sh.getRange(1, 1, 1, n);
  hdr.setValues([cols.map(c => c.label)])
    .setBackgrounds([cols.map(c => C[c.group] || C.meta)])
    .setFontFamily('Roboto').setFontSize(10).setFontWeight('bold').setFontColor(C.text)
    .setVerticalAlignment('middle').setHorizontalAlignment('left').setWrap(true)
    .setBorder(null, null, true, null, null, null, C.line, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sh.setRowHeight(1, 42);
  sh.setFrozenRows(1);
  if (opts.freezeCols) sh.setFrozenColumns(opts.freezeCols);

  // Body
  const body = sh.getRange(2, 1, sh.getMaxRows() - 1, n);
  body.setFontFamily('Roboto').setFontSize(10).setFontColor(C.text)
    .setVerticalAlignment('middle').setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

  cols.forEach((c, i) => {
    const col = i + 1;
    sh.setColumnWidth(col, c.width || 120);
    if (c.note) sh.getRange(1, col).setNote(c.note);
    if (c.align) sh.getRange(1, col, sh.getMaxRows(), 1).setHorizontalAlignment(c.align);
    if (c.fmt) sh.getRange(2, col, sh.getMaxRows() - 1, 1).setNumberFormat(c.fmt);
    if (c.hidden) sh.hideColumns(col);
  });

  sh.setHiddenGridlines(true);

  // Conditional format: aturan khusus dulu, baru zebra lembut
  const zebra = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(ISEVEN(ROW()),$A2<>"")')
    .setBackground(C.zebra).setRanges([body]).build();
  const line = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$A2<>""')
    .setRanges([body]).setBackground('#FFFFFF').build();
  sh.setConditionalFormatRules((opts.rules ? opts.rules(sh) : []).concat([zebra, line]));

  return sh;
}

function rule_(range, text, bg, fg) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains(text).setBackground(bg).setFontColor(fg)
    .setRanges([range]).build();
}

// ============================================================
// 🛠️ UTILITAS
// ============================================================
function log_(ss, event, id, hasil, payload) {
  const sh = ss.getSheetByName(SH.LOG);
  const p = Object.assign({}, payload);
  delete p.token;
  sh.getRange(sh.getLastRow() + 1, 1, 1, COLS_LOG.length)
    .setValues([[new Date(), String(event || '-'), String(id || '-'), hasil, JSON.stringify(p).slice(0, 4000)]]);
}

function findRow_(sh, col, value) {
  const last = sh.getLastRow();
  if (last < 2 || !value) return 0;
  const hit = sh.getRange(2, col, last - 1, 1)
    .createTextFinder(String(value)).matchEntireCell(true).matchCase(false).findNext();
  return hit ? hit.getRow() : 0;
}

function newId_() {
  return 'HK-' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
}

function indexOf_(cols) {
  const m = {};
  cols.forEach((c, i) => m[c.key] = i + 1);
  return m;
}

function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// 📋 MENU & TES
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi().createMenu('🧩 Hackathon')
    .addItem('✨ Siapkan / rapikan sheet', 'setup')
    .addItem('🧪 Kirim data contoh', 'testPost')
    .addToUi();
}

/** Simulasi alur lengkap 1 peserta: identitas → kuis → selesai */
function testPost() {
  const send = body => JSON.parse(doPost({ postData: { contents: JSON.stringify(body) } }).getContent());

  const r1 = send({ event: 'identitas', nama: 'Raka Contoh', kota: 'Kupang', email: 'raka.contoh@mail.com', wa: '+62 812-0000-0000', linkedin: 'https://linkedin.com/in/raka-contoh', latar: 'mahasiswa', lang: 'id' });
  Logger.log(r1);
  const r2 = send({ event: 'kuis', id: r1.id, jawab: [2, 1, 0, 0, 1, 1] });
  Logger.log(r2);
  const r3 = send({ event: 'selesai', id: r1.id, override: 'CTO' });
  Logger.log(r3);

  try { ss_().toast('Data contoh terkirim: ' + r1.id, 'Hackathon', 4); } catch (_) {}
}
