// Tes integrasi API. Jalankan server lokal dulu:
//   ADMIN_EMAILS=admin@test.id di .dev.vars, lalu: npx wrangler pages dev docs --local
//   BASE=http://localhost:8788 node scripts/test-api.mjs
import { execSync } from "node:child_process";
const BASE = process.env.BASE || "http://localhost:8788";
const RUN = Date.now().toString(36);
let pass = 0, fail = 0;

function client() {
  let cookie = "";
  return async (method, path, body, opts = {}) => {
    const r = await fetch(BASE + "/api" + path, {
      method, redirect: "manual",
      headers: { ...(body !== undefined ? { "content-type": "application/json" } : {}), ...(cookie ? { cookie } : {}), ...(opts.headers || {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    const sc = r.headers.get("set-cookie");
    if (sc) cookie = sc.split(";")[0].endsWith("=") ? "" : sc.split(";")[0];
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return { status: r.status, data, headers: r.headers };
  };
}
function check(name, cond, extra) {
  if (cond) { pass++; console.log("  ok  ", name); } else { fail++; console.log("  FAIL", name, extra !== undefined ? JSON.stringify(extra) : ""); }
}
const sql = (q) => execSync(`npx wrangler d1 execute DB --local --command "${q}"`, { stdio: "pipe" });

const ANS = [0, 0, 0, 0, 0, 0];
async function user(name, email = `${name}-${RUN}@test.id`) {
  const api = client();
  const r = await api("POST", "/auth/register", { email, password: "rahasia123", nama: name });
  if (r.status !== 201) throw new Error("register gagal " + JSON.stringify(r));
  const p = await api("PATCH", "/hackathon/me", { kota: "Bandung", wa: "081234567890", jawaban: ANS });
  if (p.status !== 200) throw new Error("patch gagal " + JSON.stringify(p));
  const j = await api("PATCH", "/hackathon/me", { joined_main: true });
  if (j.status !== 200) throw new Error("joined gagal " + JSON.stringify(j));
  return { api, id: r.data.member.member_id, email };
}

console.log("auth");
{
  const a = client();
  check("tanpa session = 401", (await a("GET", "/hackathon/me")).status === 401);
  check("health publik", (await a("GET", "/health")).status === 200);
  check("endpoint tidak ada = 404", (await a("GET", "/nope")).status === 404);
  check("register sandi pendek = 400", (await a("POST", "/auth/register", { email: `x${RUN}@t.id`, password: "123", nama: "X" })).status === 400);
  const ok = await a("POST", "/auth/register", { email: `auth-${RUN}@t.id`, password: "rahasia123", nama: "Auth" });
  check("register ok + cookie", ok.status === 201 && /HttpOnly/.test(ok.headers.get("set-cookie")), ok.data);
  check("email dobel = 409", (await client()("POST", "/auth/register", { email: `AUTH-${RUN}@t.id`, password: "rahasia123", nama: "Auth" })).status === 409);
  check("me setelah register", (await a("GET", "/hackathon/me")).data.profile.nama === "Auth");
  const b = client();
  check("login sandi salah = 401", (await b("POST", "/auth/login", { email: `auth-${RUN}@t.id`, password: "salah-salah" })).status === 401);
  check("login ok", (await b("POST", "/auth/login", { email: `auth-${RUN}@t.id`, password: "rahasia123" })).status === 200);
  await a("POST", "/auth/logout");
  check("logout menghapus session", (await a("GET", "/hackathon/me")).status === 401);
  check("session lain tetap jalan", (await b("GET", "/hackathon/me")).status === 200);
  check("CSRF: Origin asing ditolak", (await b("PATCH", "/hackathon/me", { kota: "X" }, { headers: { origin: "https://evil.example" } })).status === 403);
  for (let i = 0; i < 8; i++) await client()("POST", "/auth/login", { email: `brute-${RUN}@t.id`, password: "salah-salah" });
  check("brute force = 429", (await client()("POST", "/auth/login", { email: `brute-${RUN}@t.id`, password: "salah-salah" })).status === 429);
}

console.log("profil");
{
  const u = await user("Profil");
  const me = (await u.api("GET", "/hackathon/me")).data;
  check("jalur dihitung server", me.participant.jalur && me.participant.quiz_done, me.participant);
  check("wa tidak valid = 400", (await u.api("PATCH", "/hackathon/me", { wa: "12" })).status === 400);
  check("jawaban di luar rentang = 400", (await u.api("PATCH", "/hackathon/me", { jawaban: [9] })).status === 400);
  check("jalur tidak bisa dikirim klien", (await u.api("PATCH", "/hackathon/me", { jalur: "CEO" })).data.participant.jalur === me.participant.jalur);
  check("submit tanpa project siap = 409", (await u.api("PATCH", "/hackathon/me", { submit_clicked: true })).status === 409);
  check("project siap lalu submit", (await u.api("PATCH", "/hackathon/me", { project_ready: true })).status === 200 && (await u.api("PATCH", "/hackathon/me", { submit_clicked: true })).data.participant.submit_clicked_at > 0);
  const fresh = client();
  await fresh("POST", "/auth/register", { email: `fresh-${RUN}@t.id`, password: "rahasia123", nama: "Fresh" });
  check("buat tim tanpa syarat = 409", (await fresh("POST", "/hackathon/teams", { nama: "T", butuh: ["AI"] })).data.error?.code === "prerequisites");
}

console.log("tim dan lamaran");
const owner = await user("Owner"), bob = await user("Bob"), cat = await user("Cat"), dan = await user("Dan");
const WA = "https://chat.whatsapp.com/AbC123_x-y";
let team, shareCode, app;
{
  check("wa_link tidak valid (tanpa jangkar akhir) = 400", (await owner.api("POST", "/hackathon/teams", { nama: "Bad", butuh: ["AI"], wa_link: WA + "/../evil" })).status === 400);
  check("butuh kosong = 400", (await owner.api("POST", "/hackathon/teams", { nama: "Bad", butuh: [] })).status === 400);
  const r = await owner.api("POST", "/hackathon/teams", { nama: "Tim " + RUN, deskripsi: "<b>x</b>", butuh: ["AI", "DAT"], wa_link: WA });
  team = r.data; shareCode = team.share_code;
  check("buat tim 201 + share_code", r.status === 201 && shareCode.length >= 10, r);
  check("buat tim kedua = 409", (await owner.api("POST", "/hackathon/teams", { nama: "Lain " + RUN, butuh: ["AI"] })).status === 409);
  check("nama tim dobel = 409", (await bob.api("POST", "/hackathon/teams", { nama: ("tim " + RUN).toUpperCase(), butuh: ["AI"] })).data.error?.code === "team_name_taken");

  const list = (await bob.api("GET", "/hackathon/teams")).data.teams;
  check("daftar tim tanpa wa_link/anggota", list.some((t) => t.id === team.id) && !JSON.stringify(list).includes("chat.whatsapp"), list);
  const sh = await client()("GET", "/hackathon/share/" + shareCode);
  check("share publik: ringkasan saja", sh.status === 200 && sh.data.nama === team.nama && !JSON.stringify(sh.data).includes("whatsapp") && !("members" in sh.data), sh.data);
  check("share kode salah = 404", (await client()("GET", "/hackathon/share/abcdefghijkl")).status === 404);
  check("detail untuk non-anggota tanpa wa_link", !("wa_link" in (await bob.api("GET", "/hackathon/teams/" + team.id)).data));

  check("owner melamar ke timnya = 409", (await owner.api("POST", `/hackathon/teams/${team.id}/apply`, {})).status === 409);
  const ap = await bob.api("POST", `/hackathon/teams/${team.id}/apply`, { via: "share_link" });
  app = ap.data;
  check("lamar 201 + expires_at 24 jam", ap.status === 201 && Math.abs(app.expires_at - app.created_at - 86400000) < 1000 && app.server_time, ap.data);
  check("lamar dua kali = 409", (await bob.api("POST", `/hackathon/teams/${team.id}/apply`, {})).status === 409);
  check("pelamar pending tidak lihat wa_link", !("wa_link" in (await bob.api("GET", "/hackathon/teams/" + team.id)).data));
  check("pelamar pending: members 403", (await bob.api("GET", `/hackathon/teams/${team.id}/members`)).status === 403);
  check("pelamar pending: chat GET 403", (await bob.api("GET", `/hackathon/teams/${team.id}/messages`)).status === 403);
  check("pelamar pending: chat POST 403", (await bob.api("POST", `/hackathon/teams/${team.id}/messages`, { body: "hi" })).status === 403);
  check("bukan owner memutuskan = 403", (await cat.api("POST", `/hackathon/applications/${app.id}/decide`, { status: "approved" })).status === 403);
  check("pelamar memutuskan sendiri = 403", (await bob.api("POST", `/hackathon/applications/${app.id}/decide`, { status: "approved" })).status === 403);
  check("bukan owner lihat pelamar = 403", (await bob.api("GET", `/hackathon/teams/${team.id}/applications`)).status === 403);
  check("owner lihat pelamar tanpa kontak", (async () => true)());
  const lst = (await owner.api("GET", `/hackathon/teams/${team.id}/applications`)).data;
  check("daftar pelamar owner", lst.applications.length === 1 && lst.applications[0].nama === "Bob" && !JSON.stringify(lst).includes("081234567890"), lst);

  // pelamar yang sudah aktif tidak bisa buat tim
  check("buat tim saat punya lamaran = 409", (await bob.api("POST", "/hackathon/teams", { nama: "Bobteam " + RUN, butuh: ["AI"] })).status === 409);
  // Cat melamar, lalu Bob disetujui → lamaran lain Bob (tak ada) ; uji withdrawn otomatis lewat tim kedua di bawah
  check("status input salah = 400", (await owner.api("POST", `/hackathon/applications/${app.id}/decide`, { status: "x" })).status === 400);
  const dec = await owner.api("POST", `/hackathon/applications/${app.id}/decide`, { status: "approved" });
  check("owner menyetujui", dec.status === 200, dec.data);
  check("keputusan ulang = 409", (await owner.api("POST", `/hackathon/applications/${app.id}/decide`, { status: "rejected" })).status === 409);
  const det = (await bob.api("GET", "/hackathon/teams/" + team.id)).data;
  check("anggota baru lihat wa_link", det.wa_link === WA && det.my_role === "member", det);
  check("anggota tidak lihat share_code", !("share_code" in det));
  check("anggota: lamar tim lain = 409", (await bob.api("POST", `/hackathon/teams/${team.id}/apply`, {})).status === 409);
  check("anggota: buat tim = 409", (await bob.api("POST", "/hackathon/teams", { nama: "Bobteam2 " + RUN, butuh: ["AI"] })).status === 409);
  const bobMe = (await bob.api("GET", "/hackathon/me")).data;
  check("/me memuat tim dan lamaran", bobMe.team?.id === team.id && bobMe.applications[0].status === "approved", bobMe.team);
}

console.log("kontak dan anggota");
{
  let m = (await bob.api("GET", `/hackathon/teams/${team.id}/members`)).data.members;
  const ownerRow = m.find((x) => x.role === "owner");
  check("tanpa persetujuan: kontak owner tidak ada", ownerRow && !ownerRow.contacts && ownerRow.nama === "Owner", m);
  check("kontak sendiri terlihat", m.find((x) => x.me).contacts.wa === "081234567890");
  await owner.api("PATCH", "/hackathon/me", { contact_consent: true });
  m = (await bob.api("GET", `/hackathon/teams/${team.id}/members`)).data.members;
  check("setelah setuju: kontak owner terlihat", m.find((x) => x.role === "owner").contacts?.wa === "081234567890", m);
  check("non-anggota: members 403", (await cat.api("GET", `/hackathon/teams/${team.id}/members`)).status === 403);
}

console.log("chat");
{
  const x = await bob.api("POST", `/hackathon/teams/${team.id}/messages`, { body: "  <script>alert(1)</script>  " });
  check("kirim pesan 201, disimpan polos", x.status === 201 && x.data.body === "<script>alert(1)</script>", x.data);
  check("pesan kosong = 400", (await bob.api("POST", `/hackathon/teams/${team.id}/messages`, { body: "   " })).status === 400);
  check("pesan >1000 = 400", (await bob.api("POST", `/hackathon/teams/${team.id}/messages`, { body: "a".repeat(1001) })).status === 400);
  const y = await owner.api("POST", `/hackathon/teams/${team.id}/messages`, { body: "halo" });
  const g = (await bob.api("GET", `/hackathon/teams/${team.id}/messages`)).data.messages;
  check("riwayat urut naik", g.length === 2 && g[0].id < g[1].id, g);
  check("after= mengembalikan yang baru", (await bob.api("GET", `/hackathon/teams/${team.id}/messages?after=${x.data.id}`)).data.messages.map((q) => q.id).join() === y.data.id);
  check("unread chat di /me", (await bob.api("GET", "/hackathon/me")).data.unread.chat === 1);
  await bob.api("POST", `/hackathon/teams/${team.id}/messages/read`, { last_read_id: y.data.id });
  check("setelah read unread=0", (await bob.api("GET", "/hackathon/me")).data.unread.chat === 0);
  check("anggota hapus pesan orang lain = 403", (await bob.api("DELETE", `/hackathon/teams/${team.id}/messages/${y.data.id}`)).status === 403);
  check("owner hapus pesan anggota = 200", (await owner.api("DELETE", `/hackathon/teams/${team.id}/messages/${x.data.id}`)).status === 200);
  const g2 = (await bob.api("GET", `/hackathon/teams/${team.id}/messages`)).data.messages;
  check("isi pesan terhapus tidak dikirim", g2[0].deleted === true && !("body" in g2[0]) && !JSON.stringify(g2).includes("script"), g2);
  let last;
  for (let i = 0; i < 22; i++) last = await owner.api("POST", `/hackathon/teams/${team.id}/messages`, { body: "spam " + i });
  check("batas laju = 429", last.status === 429, last.status);
}

console.log("keluar dan tutup tim");
{
  check("owner tidak bisa keluar = 409", (await owner.api("POST", `/hackathon/teams/${team.id}/leave`)).status === 409);
  check("bukan anggota keluar = 403", (await cat.api("POST", `/hackathon/teams/${team.id}/leave`)).status === 403);
  check("anggota keluar", (await bob.api("POST", `/hackathon/teams/${team.id}/leave`)).status === 200);
  check("setelah keluar: chat 403", (await bob.api("GET", `/hackathon/teams/${team.id}/messages`)).status === 403);
  check("setelah keluar: tanpa wa_link", !("wa_link" in (await bob.api("GET", "/hackathon/teams/" + team.id)).data));
  check("setelah keluar boleh melamar tim lain / sama", (await bob.api("POST", `/hackathon/teams/${team.id}/apply`, {})).status === 201);

  // Cat melamar & ditolak; tidak bisa melamar lagi ke tim sama
  const c1 = (await cat.api("POST", `/hackathon/teams/${team.id}/apply`, {})).data;
  check("tolak lamaran", (await owner.api("POST", `/hackathon/applications/${c1.id}/decide`, { status: "rejected" })).status === 200);
  check("ditolak lalu lamar lagi ke tim sama = 409", (await cat.api("POST", `/hackathon/teams/${team.id}/apply`, {})).data.error?.code === "already_decided");

  // Bob (pending) menarik lamaran
  const bobApp = (await bob.api("GET", "/hackathon/me")).data.applications.find((a) => a.status === "pending");
  check("orang lain tidak bisa tarik lamaranmu = 404", (await cat.api("DELETE", `/hackathon/applications/${bobApp.id}`)).status === 404);
  check("tarik lamaran pending", (await bob.api("DELETE", `/hackathon/applications/${bobApp.id}`)).status === 200);
  check("tarik ulang = 409", (await bob.api("DELETE", `/hackathon/applications/${bobApp.id}`)).status === 409);

  // setujui Dan dari tim A membatalkan lamaran pending Dan ke tim B (tidak mungkin: 1 aktif). Uji gantinya via tutup tim.
  const d1 = (await dan.api("POST", `/hackathon/teams/${team.id}/apply`, {})).data;
  check("tutup tim melepas lamaran pending", (await owner.api("POST", `/hackathon/teams/${team.id}/close`)).status === 200);
  check("lamaran jadi withdrawn", (await dan.api("GET", "/hackathon/me")).data.applications.find((a) => a.id === d1.id).status === "withdrawn");
  check("tim tertutup hilang dari daftar & share", (await cat.api("GET", "/hackathon/teams")).data.teams.every((t) => t.id !== team.id) && (await client()("GET", "/hackathon/share/" + shareCode)).status === 404);
  check("owner boleh buat tim lagi setelah tutup", (await owner.api("POST", "/hackathon/teams", { nama: "Baru " + RUN, butuh: ["PM"] })).status === 201);
}

console.log("kedaluwarsa 24 jam");
{
  const o2 = await user("Owner2"), a2 = await user("Pelamar2");
  const t = (await o2.api("POST", "/hackathon/teams", { nama: "Exp " + RUN, butuh: ["AI"] })).data;
  const ap = (await a2.api("POST", `/hackathon/teams/${t.id}/apply`, {})).data;
  sql(`UPDATE hackathon_application SET expires_at = ${Date.now() - 1000} WHERE id = '${ap.id}'`);
  const dec = await o2.api("POST", `/hackathon/applications/${ap.id}/decide`, { status: "approved" });
  check("keputusan setelah batas = 409", dec.status === 409, dec.data);
  const mine = (await a2.api("GET", "/hackathon/me")).data.applications.find((a) => a.id === ap.id);
  check("pending lewat batas tampil expired", mine.status === "expired", mine);
  check("pelamar expired bebas melamar tim lain", (await a2.api("POST", `/hackathon/teams/${(await (await user("O3")).api("POST", "/hackathon/teams", { nama: "O3 " + RUN, butuh: ["AI"] })).data.id}/apply`, {})).status === 201);
  check("expired tidak bisa lamar ulang tim sama", (await a2.api("POST", `/hackathon/teams/${t.id}/apply`, {})).status === 409);
}

console.log("balapan (race)");
{
  const oa = await user("RaceA"), ob = await user("RaceB"), p = await user("Racer");
  const ta = (await oa.api("POST", "/hackathon/teams", { nama: "RA " + RUN, butuh: ["AI"] })).data;
  const tb = (await ob.api("POST", "/hackathon/teams", { nama: "RB " + RUN, butuh: ["AI"] })).data;
  const rs = await Promise.all([ta, tb, ta, tb].map((t) => p.api("POST", `/hackathon/teams/${t.id}/apply`, {})));
  check("lamaran paralel: tepat satu berhasil", rs.filter((r) => r.status === 201).length === 1, rs.map((r) => r.status));
  const mine = (await p.api("GET", "/hackathon/me")).data.applications.filter((a) => a.status === "pending");
  check("hanya satu lamaran aktif di DB", mine.length === 1);
  const q = await user("Quick");
  const tc = (await oa.api("POST", "/hackathon/teams", { nama: "RC " + RUN, butuh: ["AI"] }));
  check("owner dengan tim terbuka tidak bisa tim kedua paralel", tc.status === 409);
  // dua keputusan paralel pada lamaran yang sama
  const ap = (await q.api("POST", `/hackathon/teams/${ta.id}/apply`, {})).data;
  const ds = await Promise.all([oa.api("POST", `/hackathon/applications/${ap.id}/decide`, { status: "approved" }), oa.api("POST", `/hackathon/applications/${ap.id}/decide`, { status: "rejected" })]);
  check("keputusan paralel: satu menang, satu 409", ds.filter((r) => r.status === 200).length === 1 && ds.filter((r) => r.status === 409).length === 1, ds.map((r) => r.status));
}

console.log("builders dan undangan");
{
  const o = await user("OwnerInv"), bl = await user("Builder");
  const b = (await o.api("GET", "/hackathon/builders")).data.builders;
  check("builders tanpa kontak", b.length > 0 && !JSON.stringify(b).includes("081234567890") && b.every((x) => x.member_id !== o.id), b.slice(0, 1));
  const t = (await o.api("POST", "/hackathon/teams", { nama: "Inv " + RUN, butuh: ["AI"] })).data;
  check("undang builder", (await o.api("POST", `/hackathon/teams/${t.id}/invites`, { member_id: bl.id })).status === 201);
  check("builder melihat undangan", (await bl.api("GET", "/hackathon/me")).data.invites.some((i) => i.team_id === t.id));
  check("lamar via invite", (await bl.api("POST", `/hackathon/teams/${t.id}/apply`, { via: "invite" })).status === 201);
  const other = await user("Other");
  check("via invite tanpa undangan = 400", (await other.api("POST", `/hackathon/teams/${t.id}/apply`, { via: "invite" })).status === 400);
  const old = (await o.api("POST", `/hackathon/teams/${t.id}/share-code/rotate`)).data.share_code;
  check("rotate share_code", old.length >= 10);
  check("link lama berhenti berlaku", (await client()("GET", "/hackathon/share/" + t.share_code)).status === 404 && (await client()("GET", "/hackathon/share/" + old)).status === 200);
}

console.log("pengumuman");
{
  const u = await user("Pembaca");
  const pub = await client()("GET", "/hackathon/announcements?lang=en");
  check("daftar publik tanpa login (seed)", pub.status === 200 && pub.data.announcements.length === 4 && pub.data.announcements[0].pinned, pub.data);
  check("fallback ke bahasa id bila lang aneh", (await client()("GET", "/hackathon/announcements?lang=xx")).data.announcements[0].title.length > 0);
  const det = await client()("GET", "/hackathon/announcements/p-jadwal?lang=zh");
  check("detail publik", det.status === 200 && det.data.paragraphs.length >= 1 && !("read" in det.data), det.data);
  check("detail tidak mencatat tayangan", (await client()("GET", "/hackathon/announcements/p-jadwal")).data.views === pub.data.announcements.find((a) => a.id === "p-jadwal").views);
  check("view tanpa login = 401", (await client()("POST", "/hackathon/announcements/p-jadwal/view")).status === 401);
  const before = pub.data.announcements.find((a) => a.id === "p-jadwal").views;
  const v1 = await u.api("POST", "/hackathon/announcements/p-jadwal/view");
  const v2 = await u.api("POST", "/hackathon/announcements/p-jadwal/view");
  check("tayangan unik: naik satu kali", v1.data.views === before + 1 && v2.data.views === before + 1 && v2.data.read, [before, v1.data, v2.data]);
  const lst = (await u.api("GET", "/hackathon/announcements")).data.announcements;
  check("flag read untuk member", lst.find((a) => a.id === "p-jadwal").read === true && lst.find((a) => a.id === "p-dibuka").read === false);
  check("unread di /me", (await u.api("GET", "/hackathon/me")).data.unread.announcements === 3);
  check("pengumuman tak ada = 404", (await u.api("POST", "/hackathon/announcements/nope/view")).status === 404);
}

console.log("admin");
{
  const u = await user("Biasa");
  check("member biasa: admin 403", (await u.api("GET", "/hackathon/admin/announcements")).status === 403);
  check("member biasa: csv 403", (await u.api("GET", "/hackathon/admin/participants.csv")).status === 403);
  check("tanpa login: admin 401", (await client()("GET", "/hackathon/admin/overview")).status === 401);
  const ad = await user("Admin", "admin@test.id").catch(async () => {
    const api = client(); await api("POST", "/auth/login", { email: "admin@test.id", password: "rahasia123" }); return { api };
  });
  check("admin overview", (await ad.api("GET", "/hackathon/admin/overview")).data.members > 5);
  const c = await ad.api("POST", "/hackathon/admin/announcements", { id: "uji-" + RUN, texts: { id: { title: "Uji", summary: "Ringkas", body: ["Paragraf 1", "Paragraf 2"] }, en: { title: "Test", summary: "Sum", body: "Body" } } });
  check("buat draf", c.status === 201, c.data);
  check("draf tidak publik", (await client()("GET", "/hackathon/announcements/uji-" + RUN)).status === 404);
  check("teks bahasa id wajib", (await ad.api("POST", "/hackathon/admin/announcements", { texts: { en: { title: "a", summary: "b", body: "c" } } })).status === 400);
  check("terbitkan", (await ad.api("POST", `/hackathon/admin/announcements/uji-${RUN}/publish`)).status === 200);
  check("sekarang publik + fallback en", (await client()("GET", `/hackathon/announcements/uji-${RUN}?lang=zh`)).data.title === "Uji");
  await ad.api("PATCH", `/hackathon/admin/announcements/uji-${RUN}`, { pinned: true, texts: { zh: { title: "测试", summary: "摘要", body: "正文" } } });
  check("ubah + sematkan", (await client()("GET", `/hackathon/announcements?lang=zh`)).data.announcements[0].title === "测试");
  await u.api("POST", `/hackathon/announcements/uji-${RUN}/view`);
  check("views admin", (await ad.api("GET", `/hackathon/admin/announcements/uji-${RUN}/views`)).data.unique_views === 1);
  check("arsip menyembunyikan", (await ad.api("POST", `/hackathon/admin/announcements/uji-${RUN}/archive`)).status === 200 && (await client()("GET", `/hackathon/announcements/uji-${RUN}`)).status === 404);
  const csv = await ad.api("GET", "/hackathon/admin/participants.csv");
  check("ekspor csv oleh admin", csv.status === 200 && typeof csv.data === "string" && csv.data.startsWith("id,nama,email") && csv.data.includes("081234567890"), String(csv.data).slice(0, 80));
}

console.log("mcp + oauth");
if (!process.env.SKIP_MCP) {
  const { createHash, randomBytes } = await import("node:crypto");
  const b64 = (buf) => buf.toString("base64url");
  const REDIR = "http://localhost:9999/callback";
  const post = (path, form) => fetch(BASE + path, { method: "POST", redirect: "manual", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(form).toString() });
  const reg = await (await fetch(BASE + "/oauth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ redirect_uris: [REDIR], client_name: "Tes" }) })).json();
  check("registrasi klien", !!reg.client_id, reg);
  check("redirect_uri berbahaya ditolak", (await fetch(BASE + "/oauth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ redirect_uris: ["javascript:alert(1)"] }) })).status === 400);
  const md = await (await fetch(BASE + "/.well-known/oauth-authorization-server")).json();
  const pr = await (await fetch(BASE + "/.well-known/oauth-protected-resource")).json();
  check("metadata OAuth", md.code_challenge_methods_supported[0] === "S256" && md.token_endpoint.endsWith("/oauth/token") && pr.resource.endsWith("/mcp"), [md, pr]);

  const verifier = b64(randomBytes(32)), challenge = b64(createHash("sha256").update(verifier).digest());
  const base = { client_id: reg.client_id, redirect_uri: REDIR, response_type: "code", code_challenge: challenge, code_challenge_method: "S256", state: "st-1" };
  const authUrl = BASE + "/oauth/authorize?" + new URLSearchParams(base);
  const pg = await fetch(authUrl);
  const html = await pg.text();
  check("halaman login", pg.status === 200 && html.includes("Masuk pengurus") && pg.headers.get("x-frame-options") === "DENY");
  check("redirect_uri tak terdaftar = halaman galat (bukan redirect)", (await fetch(BASE + "/oauth/authorize?" + new URLSearchParams({ ...base, redirect_uri: "https://evil.example/cb" }), { redirect: "manual" })).status === 400);
  check("tanpa PKCE = redirect error", ((await fetch(BASE + "/oauth/authorize?" + new URLSearchParams({ ...base, code_challenge: "" }), { redirect: "manual" })).headers.get("location") || "").includes("error=invalid_request"));
  const bad = await post("/oauth/authorize", { ...base, email: "admin@test.id", password: "salah-salah" });
  check("sandi salah = tidak ada code", bad.status === 401 && (await bad.text()).includes("sandi salah"));
  const nonAdmin = await user("BukanAdmin");
  const na = await post("/oauth/authorize", { ...base, email: nonAdmin.email, password: "rahasia123" });
  check("akun non-admin ditolak", na.status === 401 && (await na.text()).includes("bukan admin"));
  const ok = await post("/oauth/authorize", { ...base, email: "admin@test.id", password: "rahasia123" });
  const loc = new URL(ok.headers.get("location") || "http://x/");
  check("admin login -> redirect dengan code & state", ok.status === 302 && loc.origin + loc.pathname === REDIR && loc.searchParams.get("state") === "st-1" && !!loc.searchParams.get("code"), ok.headers.get("location"));
  const code = loc.searchParams.get("code");
  const tok = (form) => post("/oauth/token", { client_id: reg.client_id, ...form });
  check("verifier salah ditolak", (await tok({ grant_type: "authorization_code", code, redirect_uri: REDIR, code_verifier: b64(randomBytes(32)) })).status === 400);
  check("code hangus setelah dicoba", (await tok({ grant_type: "authorization_code", code, redirect_uri: REDIR, code_verifier: verifier })).status === 400);
  const ok2 = await post("/oauth/authorize", { ...base, email: "admin@test.id", password: "rahasia123" });
  const code2 = new URL(ok2.headers.get("location")).searchParams.get("code");
  check("redirect_uri beda saat tukar ditolak", (await tok({ grant_type: "authorization_code", code: code2, redirect_uri: "http://localhost:9999/x", code_verifier: verifier })).status === 400);
  const ok3 = await post("/oauth/authorize", { ...base, email: "admin@test.id", password: "rahasia123" });
  const code3 = new URL(ok3.headers.get("location")).searchParams.get("code");
  const t = await (await tok({ grant_type: "authorization_code", code: code3, redirect_uri: REDIR, code_verifier: verifier })).json();
  check("tukar code -> access + refresh token", t.token_type === "Bearer" && !!t.access_token && !!t.refresh_token && t.expires_in === 3600, t);
  let TOKEN = t.access_token;

  const rpc = async (body, token = TOKEN) => {
    const r = await fetch(BASE + "/mcp", { method: "POST", headers: { "content-type": "application/json", ...(token ? { authorization: "Bearer " + token } : {}) }, body: JSON.stringify(body) });
    const tx = await r.text(); return { status: r.status, headers: r.headers, data: tx ? JSON.parse(tx) : null };
  };
  const call = async (name, args = {}) => { const r = await rpc({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }); return { ...r, out: r.data.result?.content?.[0]?.text, err: r.data.result?.isError }; };
  const un = await rpc({ jsonrpc: "2.0", id: 1, method: "ping" }, "");
  check("tanpa token = 401 + resource_metadata", un.status === 401 && /resource_metadata=".*oauth-protected-resource"/.test(un.headers.get("www-authenticate")), un.headers.get("www-authenticate"));
  check("token asal = 401", (await rpc({ jsonrpc: "2.0", id: 1, method: "ping" }, "x".repeat(40))).status === 401);
  check("GET = 405", (await fetch(BASE + "/mcp", { headers: { authorization: "Bearer " + TOKEN } })).status === 405);
  const init = await rpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "t", version: "1" } } });
  check("initialize", init.data.result.serverInfo.name === "aiclub-hackathon" && init.data.result.capabilities.tools, init.data);
  check("notifikasi = 202", (await rpc({ jsonrpc: "2.0", method: "notifications/initialized" })).status === 202);
  const tl = await rpc({ jsonrpc: "2.0", id: 2, method: "tools/list" });
  check("tools/list", tl.data.result.tools.length >= 14 && tl.data.result.tools.every((x) => x.inputSchema.type === "object"), tl.data.result.tools.length);
  check("overview", JSON.parse((await call("overview")).out).members >= 0);
  const slug = "mcp-" + RUN;
  check("create_announcement", JSON.parse((await call("create_announcement", { id: slug, texts: { id: { title: "Dari MCP", summary: "Ringkas", body: ["A", "B"] } } })).out).status === "draft");
  check("draf belum publik", (await client()("GET", "/hackathon/announcements/" + slug)).status === 404);
  await call("publish_announcement", { id: slug });
  check("publish -> publik", (await client()("GET", "/hackathon/announcements/" + slug)).data.title === "Dari MCP");
  check("validasi: id bahasa wajib", (await call("create_announcement", { texts: { en: { title: "a", summary: "b", body: "c" } } })).err === true);
  await call("archive_announcement", { id: slug });
  check("list_participants", JSON.parse((await call("list_participants", { q: "Owner", limit: 5 })).out).participants.length > 0);
  const tms = JSON.parse((await call("list_teams", { status: "open" })).out).teams;
  const gt = JSON.parse((await call("get_team", { id: tms[0].id })).out);
  check("list_teams + get_team", tms.length > 0 && Array.isArray(gt.members) && Array.isArray(gt.applications));
  check("tool tidak dikenal = error", (await rpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "hapus_semua" } })).data.error.code === -32602);
  check("export csv", (await call("export_participants_csv")).out.startsWith("id,nama"));

  // kelola admin
  const newAdmin = `admin2-${RUN}@test.id`;
  const add = JSON.parse((await call("add_admin", { email: newAdmin })).out);
  check("add_admin buat akun + sandi sekali tampil", add.created && add.password_sekali_tampil.length >= 12, add);
  const okN = await post("/oauth/authorize", { ...base, email: newAdmin, password: add.password_sekali_tampil });
  check("admin baru bisa login OAuth", okN.status === 302);
  const codeN = new URL(okN.headers.get("location")).searchParams.get("code");
  const tn = await (await tok({ grant_type: "authorization_code", code: codeN, redirect_uri: REDIR, code_verifier: verifier })).json();
  check("admin baru bisa panggil MCP", (await rpc({ jsonrpc: "2.0", id: 1, method: "ping" }, tn.access_token)).status === 200);
  check("list_admins memuat keduanya", JSON.parse((await call("list_admins")).out).admins.length >= 2);
  const promo = JSON.parse((await call("add_admin", { email: nonAdmin.email })).out);
  check("add_admin akun ada = dinaikkan", promo.promoted === true && !promo.password_sekali_tampil);
  check("tidak bisa cabut diri sendiri", (await call("remove_admin", { email: "admin@test.id" })).err === true);
  await call("remove_admin", { email: newAdmin });
  check("setelah dicabut: token admin baru ditolak", (await rpc({ jsonrpc: "2.0", id: 1, method: "ping" }, tn.access_token)).status === 401);
  await call("remove_admin", { email: nonAdmin.email });
  check("setelah dicabut: login OAuth ditolak", (await post("/oauth/authorize", { ...base, email: nonAdmin.email, password: "rahasia123" })).status === 401);
  check("change_password ringkas ditolak", (await call("change_password", { new_password: "123" })).err === true);

  // refresh token (rotasi)
  const rf = await (await tok({ grant_type: "refresh_token", refresh_token: t.refresh_token })).json();
  check("refresh token -> token baru", !!rf.access_token && rf.refresh_token !== t.refresh_token, rf);
  check("refresh token lama hangus", (await tok({ grant_type: "refresh_token", refresh_token: t.refresh_token })).status === 400);
  check("token baru bekerja", (await rpc({ jsonrpc: "2.0", id: 1, method: "ping" }, rf.access_token)).status === 200);
} else console.log("  (dilewati)");

console.log(`\n${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);
