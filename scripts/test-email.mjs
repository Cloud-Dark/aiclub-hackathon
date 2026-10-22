// Tes unit email Resend dengan fetch palsu: node scripts/test-email.mjs
import { sendEmail, mail } from "../server/email.js";
let calls = [], ok = 0, bad = 0;
const check = (n, c) => { c ? ok++ : bad++; console.log(c ? "  ok  " : "  FAIL", n); };
globalThis.fetch = async (url, init) => { calls.push({ url, init }); return { ok: true, status: 200, text: async () => "" }; };

check("tanpa API key: dilewati", (await sendEmail({}, { to: "a@b.id", subject: "s", text: "t" })) === false && calls.length === 0);
const env = { RESEND_API_KEY: "re_test", EMAIL_FROM: "X <x@aicandoit.aiclub.id>", SITE_URL: "https://aicandoit.aiclub.id" };
check("kirim ok", (await sendEmail(env, { to: "a@b.id", subject: "Halo", text: "Isi <b>" })) === true);
const c = calls[0], body = JSON.parse(c.init.body);
check("endpoint & auth Resend", c.url === "https://api.resend.com/emails" && c.init.headers.authorization === "Bearer re_test");
check("payload: from/to/subject", body.from === "X <x@aicandoit.aiclub.id>" && body.to[0] === "a@b.id" && body.subject === "Halo");
check("html di-escape (anti injeksi)", body.html.includes("&lt;b&gt;") && !body.html.includes("<b>"));
globalThis.fetch = async () => ({ ok: false, status: 422, text: async () => "domain belum terverifikasi" });
check("gagal kirim tidak melempar", (await sendEmail(env, { to: "a@b.id", subject: "s", text: "t" })) === false);
globalThis.fetch = async () => { throw new Error("net"); };
check("error jaringan tidak melempar", (await sendEmail(env, { to: "a@b.id", subject: "s", text: "t" })) === false);
const m = mail.decided({ email: "p@q.id", nama: "P" }, "TIMKU", true);
check("templat keputusan", m.to === "p@q.id" && m.subject.includes("disetujui") && m.text.includes("TIMKU"));
check("templat lamaran baru & kedaluwarsa", mail.newApplication({ email: "o@q.id", nama: "O" }, "Bob", "T").to === "o@q.id" && mail.expired({ email: "p@q.id", nama: "P" }, "T").subject.includes("kedaluwarsa"));
console.log(`\n${ok} lulus, ${bad} gagal`); process.exit(bad ? 1 : 0);
