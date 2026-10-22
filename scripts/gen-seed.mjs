// Membuat migrations/0002_seed_announcements.sql dari teks di src/i18n (jalankan sekali: node scripts/gen-seed.mjs)
import { writeFileSync } from "node:fs";
import id from "../src/i18n/id.js";
import en from "../src/i18n/en.js";
import zh from "../src/i18n/zh.js";

const META = [
  { id: "p-jadwal", at: "2026-10-21T10:00:00+07:00", pin: 1 },
  { id: "p-batas-1-nov", at: "2026-10-21T09:00:00+07:00", pin: 0 },
  { id: "p-aturan-tim", at: "2026-10-19T13:00:00+07:00", pin: 0 },
  { id: "p-dibuka", at: "2026-10-15T09:00:00+07:00", pin: 0 }
];
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const out = [];
META.forEach((m, i) => {
  const at = Date.parse(m.at);
  out.push(`INSERT INTO hackathon_announcement (id, pinned, status, published_at, created_by, created_at, updated_at) VALUES (${q(m.id)}, ${m.pin}, 'published', ${at}, 'seed', ${at}, ${at});`);
  for (const [lang, d] of [["id", id], ["en", en], ["zh", zh]]) {
    const a = d.announcements[i];
    out.push(`INSERT INTO hackathon_announcement_i18n VALUES (${q(m.id)}, ${q(lang)}, ${q(a.judul)}, ${q(a.ringkas)}, ${q(a.isi.join("\n\n"))});`);
  }
});
writeFileSync(new URL("../migrations/0002_seed_announcements.sql", import.meta.url), out.join("\n") + "\n");
