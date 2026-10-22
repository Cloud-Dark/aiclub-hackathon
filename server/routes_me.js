// Auth, profil, dan data peserta.
import { E, ApiError, newId, readJson, str, optUrl, EMAIL_RE, waValid, parseJson } from "./util.js";
import {
  hashPassword, newSalt, safeEqual, createSession, destroySession, cookieHeader, SESSION_MS,
  throttleLogin, recordFailedLogin, isAdminEmail
} from "./auth.js";
import { verifyTurnstile } from "./turnstile.js";
import { jalurOf, quizComplete, LATAR, URUT, QUIZ_LEN, WEIGHTS } from "./scoring.js";
import { getParticipant, activeMembership, profileOf, participantOf } from "./db.js";

const sessionResponse = async (c, member, status = 200) => {
  const token = await createSession(c.db, member.id, c.now);
  return c.json({ member: profileOf(member) }, status, { "set-cookie": cookieHeader(c.url, token, SESSION_MS / 1000) });
};

export async function register(c) {
  const b = await readJson(c.req);
  await verifyTurnstile(c.env, b.turnstile_token, c.req);
  const email = str(b.email, "email", { max: 120, min: 3 }).toLowerCase();
  if (!EMAIL_RE.test(email)) throw E.bad("Format email tidak valid");
  if (typeof b.password !== "string" || b.password.length < 8 || b.password.length > 128) throw E.bad("Sandi 8 sampai 128 karakter");
  const nama = str(b.nama, "nama", { max: 80, min: 1 });
  if (await c.db.prepare("SELECT 1 FROM hackathon_member WHERE email = ?").bind(email).first()) throw E.conflict("Email sudah terdaftar", "email_taken");
  const salt = newSalt();
  const id = newId("mem", c.now);
  const role = isAdminEmail(c.env, email) ? "admin" : "member";
  try {
    await c.db.batch([
      c.db.prepare("INSERT INTO hackathon_member (id, email, nama, pass_hash, pass_salt, role, created_at) VALUES (?,?,?,?,?,?,?)")
        .bind(id, email, nama, await hashPassword(b.password, salt), salt, role, c.now),
      c.db.prepare("INSERT INTO hackathon_participant (member_id, created_at, updated_at) VALUES (?,?,?)").bind(id, c.now, c.now)
    ]);
  } catch (e) { throw E.conflict("Email sudah terdaftar", "email_taken"); }
  return sessionResponse(c, { id, email, nama, kota: "", wa: "", linkedin: "", github: "", role }, 201);
}

export async function login(c) {
  const b = await readJson(c.req);
  await verifyTurnstile(c.env, b.turnstile_token, c.req);
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!email || typeof b.password !== "string" || b.password.length > 128) throw E.bad("Email dan sandi wajib diisi");
  await throttleLogin(c.db, email, c.now);
  const m = await c.db.prepare("SELECT * FROM hackathon_member WHERE email = ?").bind(email).first();
  // hash tetap dihitung bila email tidak ada, supaya waktu respons tidak membocorkan keberadaan akun
  const got = await hashPassword(b.password, m ? m.pass_salt : "00".repeat(16));
  if (!m || !safeEqual(got, m.pass_hash)) {
    await recordFailedLogin(c.db, email, c.now);
    throw new ApiError(401, "invalid_credentials", "Email atau sandi salah");
  }
  const role = isAdminEmail(c.env, email) ? "admin" : m.role;
  if (role !== m.role) await c.db.prepare("UPDATE hackathon_member SET role = ? WHERE id = ?").bind(role, m.id).run();
  return sessionResponse(c, { ...m, role });
}

export async function logout(c) {
  await destroySession(c.req, c.db);
  return c.json({ ok: true }, 200, { "set-cookie": cookieHeader(c.url, "", 0) });
}

export async function getMe(c) {
  const m = c.member, db = c.db, now = c.now;
  const p = await getParticipant(db, m.id);
  const [mem, apps, invites, annUnread, activity] = await Promise.all([
    activeMembership(db, m.id),
    db.prepare(
      `SELECT a.id, a.team_id, t.nama AS team_nama, a.status, a.via, a.created_at, a.expires_at, a.decided_at
         FROM hackathon_application a JOIN hackathon_team t ON t.id = a.team_id
        WHERE a.member_id = ? ORDER BY a.created_at DESC LIMIT 50`
    ).bind(m.id).all(),
    db.prepare(
      `SELECT i.id, i.team_id, t.nama AS team_nama, i.created_at
         FROM hackathon_invite i JOIN hackathon_team t ON t.id = i.team_id AND t.status = 'open'
        WHERE i.member_id = ? ORDER BY i.created_at DESC`
    ).bind(m.id).all(),
    db.prepare(
      `SELECT COUNT(*) n FROM hackathon_announcement a
        WHERE a.status = 'published' AND NOT EXISTS
          (SELECT 1 FROM hackathon_announcement_view v WHERE v.announcement_id = a.id AND v.member_id = ?)`
    ).bind(m.id).first(),
    db.prepare(
      `SELECT a.kind, a.created_at AS at, t.nama AS team FROM hackathon_activity a LEFT JOIN hackathon_team t ON t.id = a.team_id
        WHERE a.member_id = ? ORDER BY a.created_at DESC, a.id DESC LIMIT 40`
    ).bind(m.id).all()
  ]);
  let team = null, chatUnread = 0;
  if (mem) {
    const t = await db.prepare("SELECT id, nama, deskripsi, kota, butuh, wa_link, share_code, status FROM hackathon_team WHERE id = ?").bind(mem.team_id).first();
    team = { id: t.id, nama: t.nama, deskripsi: t.deskripsi, kota: t.kota, butuh: parseJson(t.butuh, []), wa_link: t.wa_link, role: mem.role, joined_at: mem.joined_at };
    if (mem.role === "owner") team.share_code = t.share_code;
    const r = await db.prepare(
      `SELECT COUNT(*) n FROM hackathon_chat_message
        WHERE team_id = ? AND member_id != ? AND deleted_at IS NULL
          AND id > COALESCE((SELECT last_read_id FROM hackathon_chat_read WHERE team_id = ? AND member_id = ?), '')`
    ).bind(mem.team_id, m.id, mem.team_id, m.id).first();
    chatUnread = r.n;
  }
  return c.json({
    server_time: now,
    profile: profileOf(m), participant: participantOf(p),
    team, applications: apps.results, invites: invites.results, activity: activity.results,
    unread: { announcements: annUnread.n, chat: chatUnread }
  });
}

const FLAGS = { joined_main: "joined_main_at", tencent_clicked: "tencent_clicked_at" };

export async function patchMe(c) {
  const b = await readJson(c.req), db = c.db, now = c.now;
  const p = await getParticipant(db, c.member.id);
  const mset = {}, pset = {};

  if ("nama" in b) mset.nama = str(b.nama, "nama", { max: 80, min: 1 });
  if ("kota" in b) mset.kota = str(b.kota, "kota", { max: 60 });
  if ("wa" in b) {
    mset.wa = str(b.wa, "wa", { max: 30 });
    if (mset.wa && !waValid(mset.wa)) throw E.bad("Nomor WhatsApp harus 9 sampai 15 digit");
  }
  if ("linkedin" in b) mset.linkedin = optUrl(b.linkedin, "linkedin");
  if ("github" in b) mset.github = optUrl(b.github, "github");

  if ("latar" in b) {
    if (!LATAR.includes(b.latar)) throw E.bad("latar tidak dikenal");
    pset.latar = b.latar;
  }
  if ("jawaban" in b) {
    const j = b.jawaban;
    if (!Array.isArray(j) || j.length > QUIZ_LEN) throw E.bad(`jawaban maksimal ${QUIZ_LEN} item`);
    j.forEach((x, i) => { if (x !== null && !(Number.isInteger(x) && x >= 0 && x < WEIGHTS[i].length)) throw E.bad(`jawaban ke-${i + 1} tidak valid`); });
    pset.jawaban = JSON.stringify(j);
    pset.jalur = jalurOf(j); // dihitung server, bukan dari klien
  }
  if ("jalur_override" in b) {
    if (b.jalur_override !== null && !URUT.includes(b.jalur_override)) throw E.bad("jalur_override tidak dikenal");
    pset.jalur_override = b.jalur_override;
  }
  if ("contact_consent" in b) pset.contact_consent_at = b.contact_consent === true ? p.contact_consent_at || now : null;
  for (const [k, col] of Object.entries(FLAGS)) if (k in b) {
    if (b[k] !== true) throw E.bad(`${k} hanya bisa diisi true`);
    pset[col] = p[col] || now;
  }
  if ("project_ready" in b) {
    pset.project_ready_at = b.project_ready === true ? p.project_ready_at || now : null;
    if (b.project_ready !== true) pset.submit_clicked_at = null;
  }
  if ("submit_clicked" in b) {
    if (b.submit_clicked !== true) throw E.bad("submit_clicked hanya bisa diisi true");
    const ready = "project_ready_at" in pset ? pset.project_ready_at : p.project_ready_at;
    if (!ready) throw E.conflict("Tandai project siap terlebih dahulu", "project_not_ready");
    pset.submit_clicked_at = p.submit_clicked_at || now;
  }
  if (pset.joined_main_at) {
    const m = { ...c.member, ...mset };
    if (!m.nama || !m.kota || !waValid(m.wa)) throw E.conflict("Lengkapi data diri terlebih dahulu", "prerequisites");
    if (!quizComplete(JSON.parse(pset.jawaban || p.jawaban || "[]"))) throw E.conflict("Selesaikan kuis terlebih dahulu", "prerequisites");
  }

  const stmts = [];
  if (Object.keys(mset).length)
    stmts.push(db.prepare(`UPDATE hackathon_member SET ${Object.keys(mset).map((k) => k + " = ?").join(", ")} WHERE id = ?`).bind(...Object.values(mset), c.member.id));
  pset.updated_at = now;
  if (pset.joined_main_at && !p.joined_main_at)
    stmts.push(db.prepare("INSERT INTO hackathon_activity (id, member_id, kind, created_at) VALUES (?,?, 'join_main', ?)").bind(newId("act", now), c.member.id, now));
  stmts.push(db.prepare(`UPDATE hackathon_participant SET ${Object.keys(pset).map((k) => k + " = ?").join(", ")} WHERE member_id = ?`).bind(...Object.values(pset), c.member.id));
  await db.batch(stmts);
  c.member = { ...c.member, ...mset };
  return getMe(c);
}
