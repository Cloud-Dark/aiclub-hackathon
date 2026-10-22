// Tim, lamaran, undangan, anggota. Semua aturan brief 5.3 dijaga di sini dan oleh constraint DB.
import { E, newId, randomCode, readJson, str, parseJson, isUniqueError, WA_LINK_RE } from "./util.js";
import { URUT } from "./scoring.js";
import {
  APPROVE_MS, getParticipant, activeMembership, requireActiveMember, requirePrerequisites, jalurAktif
} from "./db.js";

const act = (db, memberId, kind, teamId, meta, now) =>
  db.prepare("INSERT INTO hackathon_activity (id, member_id, kind, team_id, meta, created_at) VALUES (?,?,?,?,?,?)")
    .bind(newId("act", now), memberId, kind, teamId, meta ? JSON.stringify(meta) : null, now);

const teamCard = (t) => ({
  id: t.id, nama: t.nama, deskripsi: t.deskripsi, kota: t.kota, butuh: parseJson(t.butuh, []),
  owner: t.owner_nama, member_count: t.member_count, created_at: t.created_at, status: t.status
});
const TEAM_SELECT =
  `SELECT t.*, m.nama AS owner_nama,
          (SELECT COUNT(*) FROM hackathon_team_member x WHERE x.team_id = t.id AND x.left_at IS NULL) AS member_count
     FROM hackathon_team t JOIN hackathon_member m ON m.id = t.owner_id`;

function parseButuh(v) {
  if (!Array.isArray(v) || !v.length || v.length > URUT.length || !v.every((r) => URUT.includes(r))) throw E.bad("butuh harus daftar peran yang dikenal (minimal satu)");
  return [...new Set(v)];
}
function parseWa(v) {
  if (v === null || v === "") return null;
  const s = str(v, "wa_link", { max: 200 });
  if (!WA_LINK_RE.test(s)) throw E.bad("wa_link harus berupa link grup https://chat.whatsapp.com/...");
  return s;
}
async function ownTeam(c, id) {
  const t = await c.db.prepare(TEAM_SELECT + " WHERE t.id = ?").bind(id).first();
  if (!t) throw E.notFound("Tim tidak ditemukan");
  if (t.owner_id !== c.member.id) throw E.forbid("Hanya owner tim yang bisa melakukan ini");
  return t;
}

export async function listTeams(c) {
  const r = await c.db.prepare(TEAM_SELECT + " WHERE t.status = 'open' ORDER BY t.created_at DESC LIMIT 200").all();
  return c.json({ server_time: c.now, teams: r.results.map(teamCard) });
}

export async function getTeam(c) {
  const t = await c.db.prepare(TEAM_SELECT + " WHERE t.id = ?").bind(c.params.id).first();
  if (!t) throw E.notFound("Tim tidak ditemukan");
  const role = await c.db.prepare("SELECT role FROM hackathon_team_member WHERE team_id = ? AND member_id = ? AND left_at IS NULL").bind(t.id, c.member.id).first();
  if (t.status !== "open" && !role) throw E.notFound("Tim tidak ditemukan");
  const app = await c.db.prepare("SELECT id, status, via, created_at, expires_at, decided_at FROM hackathon_application WHERE team_id = ? AND member_id = ? ORDER BY created_at DESC LIMIT 1").bind(t.id, c.member.id).first();
  const out = { ...teamCard(t), my_application: app || null, my_role: role ? role.role : null, server_time: c.now };
  if (role) out.wa_link = t.wa_link; // hanya anggota aktif
  if (role && role.role === "owner") out.share_code = t.share_code;
  return c.json(out);
}

export async function createTeam(c) {
  const b = await readJson(c.req), db = c.db, now = c.now, me = c.member.id;
  const p = await getParticipant(db, me);
  requirePrerequisites(c.member, p);
  const nama = str(b.nama, "nama", { max: 40, min: 1 });
  const deskripsi = "deskripsi" in b ? str(b.deskripsi, "deskripsi", { max: 200 }) : "";
  const kota = "kota" in b ? str(b.kota, "kota", { max: 60 }) : c.member.kota;
  const butuh = parseButuh(b.butuh);
  const wa = "wa_link" in b ? parseWa(b.wa_link) : null;

  if (await activeMembership(db, me)) throw E.conflict("Kamu sudah tergabung di sebuah tim", "already_in_team");
  if (await db.prepare("SELECT 1 FROM hackathon_application WHERE member_id = ? AND status IN ('pending','approved')").bind(me).first())
    throw E.conflict("Kamu masih punya lamaran aktif; tarik lamaran dulu", "active_application");
  if (await db.prepare("SELECT 1 FROM hackathon_team WHERE status = 'open' AND nama = ? COLLATE NOCASE").bind(nama).first())
    throw E.conflict("Nama tim sudah dipakai", "team_name_taken");

  const id = newId("team", now), code = randomCode(12);
  let res;
  try {
    res = await db.batch([
      db.prepare(
        `INSERT INTO hackathon_team (id, owner_id, nama, deskripsi, kota, butuh, wa_link, share_code, status, created_at)
         SELECT ?,?,?,?,?,?,?,?, 'open', ?
          WHERE NOT EXISTS (SELECT 1 FROM hackathon_application WHERE member_id = ? AND status IN ('pending','approved'))`
      ).bind(id, me, nama, deskripsi, kota, JSON.stringify(butuh), wa, code, now, me),
      db.prepare("INSERT INTO hackathon_team_member (team_id, member_id, role, joined_at) SELECT ?, ?, 'owner', ? WHERE EXISTS (SELECT 1 FROM hackathon_team WHERE id = ?)").bind(id, me, now, id),
      act(db, me, "open_team", id, { nama }, now)
    ]);
  } catch (e) {
    if (isUniqueError(e)) throw E.conflict("Tidak bisa membuat tim: sudah punya tim atau nama dipakai", "conflict");
    throw e;
  }
  if (!res[0].meta.changes) throw E.conflict("Kamu masih punya lamaran aktif; tarik lamaran dulu", "active_application");
  return c.json({ id, nama, deskripsi, kota, butuh, wa_link: wa, share_code: code, status: "open", created_at: now }, 201);
}

export async function patchTeam(c) {
  const t = await ownTeam(c, c.params.id);
  if (t.status !== "open") throw E.conflict("Tim sudah ditutup", "team_closed");
  const b = await readJson(c.req), set = {};
  if ("deskripsi" in b) set.deskripsi = str(b.deskripsi, "deskripsi", { max: 200 });
  if ("kota" in b) set.kota = str(b.kota, "kota", { max: 60 });
  if ("butuh" in b) set.butuh = JSON.stringify(parseButuh(b.butuh));
  if ("wa_link" in b) set.wa_link = parseWa(b.wa_link);
  if (!Object.keys(set).length) throw E.bad("Tidak ada yang diubah");
  await c.db.prepare(`UPDATE hackathon_team SET ${Object.keys(set).map((k) => k + " = ?").join(", ")} WHERE id = ?`).bind(...Object.values(set), t.id).run();
  c.params.id = t.id;
  return getTeam(c);
}

export async function closeTeam(c) {
  const t = await ownTeam(c, c.params.id), db = c.db, now = c.now;
  if (t.status !== "open") throw E.conflict("Tim sudah ditutup", "team_closed");
  await db.batch([
    db.prepare("UPDATE hackathon_team SET status = 'closed', closed_at = ? WHERE id = ?").bind(now, t.id),
    db.prepare("UPDATE hackathon_team_member SET left_at = ? WHERE team_id = ? AND left_at IS NULL").bind(now, t.id),
    // lamaran pending dan approved dilepas supaya orangnya bebas memilih lagi
    db.prepare("UPDATE hackathon_application SET status = 'withdrawn', decided_at = ? WHERE team_id = ? AND status IN ('pending','approved')").bind(now, t.id),
    db.prepare("DELETE FROM hackathon_invite WHERE team_id = ?").bind(t.id),
    act(db, c.member.id, "close_team", t.id, { nama: t.nama }, now)
  ]);
  return c.json({ ok: true });
}

export async function rotateShareCode(c) {
  const t = await ownTeam(c, c.params.id);
  if (t.status !== "open") throw E.conflict("Tim sudah ditutup", "team_closed");
  const code = randomCode(12);
  await c.db.prepare("UPDATE hackathon_team SET share_code = ? WHERE id = ?").bind(code, t.id).run();
  return c.json({ share_code: code });
}

// halaman undangan publik: hanya ringkasan tim
export async function shareLookup(c) {
  const code = c.params.code;
  if (!/^[a-z0-9]{10,32}$/.test(code)) throw E.notFound("Link undangan tidak berlaku");
  const t = await c.db.prepare(TEAM_SELECT + " WHERE t.share_code = ? AND t.status = 'open'").bind(code).first();
  if (!t) throw E.notFound("Link undangan tidak berlaku");
  return c.json(teamCard(t));
}

export async function applyToTeam(c) {
  const b = await readJson(c.req).catch(() => ({})), db = c.db, now = c.now, me = c.member.id;
  const via = b.via == null ? "market" : b.via;
  if (!["market", "share_link", "invite"].includes(via)) throw E.bad("via tidak dikenal");
  const p = await getParticipant(db, me);
  requirePrerequisites(c.member, p);
  const t = await db.prepare("SELECT * FROM hackathon_team WHERE id = ?").bind(c.params.id).first();
  if (!t || t.status !== "open") throw E.notFound("Tim tidak ditemukan atau sudah ditutup");
  if (t.owner_id === me) throw E.conflict("Owner tidak bisa melamar ke timnya sendiri", "own_team");
  if (await activeMembership(db, me)) throw E.conflict("Kamu sudah tergabung di sebuah tim", "already_in_team");
  if (await db.prepare("SELECT 1 FROM hackathon_application WHERE member_id = ? AND status IN ('pending','approved')").bind(me).first())
    throw E.conflict("Kamu masih punya lamaran aktif; tarik dulu sebelum melamar ke tim lain", "active_application");
  if (await db.prepare("SELECT 1 FROM hackathon_application WHERE member_id = ? AND team_id = ? AND status IN ('rejected','expired')").bind(me, t.id).first())
    throw E.conflict("Lamaranmu ke tim ini sudah ditolak atau kedaluwarsa", "already_decided");
  if (via === "invite" && !(await db.prepare("SELECT 1 FROM hackathon_invite WHERE team_id = ? AND member_id = ?").bind(t.id, me).first()))
    throw E.bad("Tidak ada undangan dari tim ini");

  const id = newId("app", now), exp = now + APPROVE_MS;
  let res;
  try {
    res = await db.batch([
      db.prepare(
        `INSERT INTO hackathon_application (id, team_id, member_id, status, via, created_at, expires_at)
         SELECT ?,?,?, 'pending', ?, ?, ?
          WHERE NOT EXISTS (SELECT 1 FROM hackathon_team_member WHERE member_id = ? AND left_at IS NULL)
            AND EXISTS (SELECT 1 FROM hackathon_team WHERE id = ? AND status = 'open')`
      ).bind(id, t.id, me, via, now, exp, me, t.id),
      act(db, me, "apply", t.id, { via }, now)
    ]);
  } catch (e) {
    if (isUniqueError(e)) throw E.conflict("Kamu masih punya lamaran aktif", "active_application");
    throw e;
  }
  if (!res[0].meta.changes) throw E.conflict("Lamaran tidak bisa dibuat saat ini", "conflict");
  return c.json({ id, team_id: t.id, status: "pending", via, created_at: now, expires_at: exp, server_time: now }, 201);
}

export async function withdrawApplication(c) {
  const now = c.now;
  const a = await c.db.prepare("SELECT * FROM hackathon_application WHERE id = ?").bind(c.params.id).first();
  if (!a || a.member_id !== c.member.id) throw E.notFound("Lamaran tidak ditemukan");
  const res = await c.db.batch([
    c.db.prepare("UPDATE hackathon_application SET status = 'withdrawn', decided_at = ? WHERE id = ? AND status = 'pending'").bind(now, a.id),
    act(c.db, c.member.id, "withdraw", a.team_id, null, now)
  ]);
  if (!res[0].meta.changes) throw E.conflict("Hanya lamaran yang masih menunggu yang bisa ditarik", "not_pending");
  return c.json({ ok: true });
}

export async function leaveTeam(c) {
  const now = c.now, me = c.member.id;
  const role = await requireActiveMember(c.db, c.params.id, me);
  if (role === "owner") throw E.conflict("Owner tidak bisa keluar; tutup tim dulu", "owner_cannot_leave");
  await c.db.batch([
    c.db.prepare("UPDATE hackathon_team_member SET left_at = ? WHERE team_id = ? AND member_id = ? AND left_at IS NULL").bind(now, c.params.id, me),
    c.db.prepare("UPDATE hackathon_application SET status = 'withdrawn', decided_at = ? WHERE team_id = ? AND member_id = ? AND status = 'approved'").bind(now, c.params.id, me),
    act(c.db, me, "leave", c.params.id, null, now)
  ]);
  return c.json({ ok: true });
}

export async function listApplications(c) {
  const t = await ownTeam(c, c.params.id);
  const r = await c.db.prepare(
    `SELECT a.id, a.member_id, m.nama, m.kota, p.jalur, p.jalur_override, a.status, a.via, a.created_at, a.expires_at, a.decided_at
       FROM hackathon_application a
       JOIN hackathon_member m ON m.id = a.member_id JOIN hackathon_participant p ON p.member_id = a.member_id
      WHERE a.team_id = ? ORDER BY a.created_at DESC LIMIT 200`
  ).bind(t.id).all();
  return c.json({
    server_time: c.now,
    applications: r.results.map(({ jalur, jalur_override, ...a }) => ({ ...a, jalur_aktif: jalur_override || jalur }))
  });
}

export async function decideApplication(c) {
  const b = await readJson(c.req), db = c.db, now = c.now, me = c.member.id;
  if (!["approved", "rejected"].includes(b.status)) throw E.bad("status harus approved atau rejected");
  const a = await db.prepare("SELECT a.*, t.owner_id, t.status AS team_status FROM hackathon_application a JOIN hackathon_team t ON t.id = a.team_id WHERE a.id = ?").bind(c.params.id).first();
  if (!a) throw E.notFound("Lamaran tidak ditemukan");
  if (a.owner_id !== me) throw E.forbid("Hanya owner tim yang bisa memutuskan lamaran");
  if (a.team_status !== "open") throw E.conflict("Tim sudah ditutup", "team_closed");

  const upd = db.prepare(
    `UPDATE hackathon_application SET status = ?, decided_at = ?, decided_by = ?
      WHERE id = ? AND status = 'pending' AND expires_at > ?`
  ).bind(b.status, now, me, a.id, now);
  let changed;
  try {
    if (b.status === "rejected") {
      changed = (await db.batch([upd, act(db, a.member_id, "rejected", a.team_id, null, now)]))[0].meta.changes;
    } else {
      // satu transaksi: setujui + jadikan anggota + tarik lamaran pending lain; gagal salah satu = batal semua
      const r = await db.batch([
        upd,
        db.prepare(
          `INSERT INTO hackathon_team_member (team_id, member_id, role, joined_at)
           SELECT team_id, member_id, 'member', ? FROM hackathon_application
            WHERE id = ? AND status = 'approved' AND decided_at = ? AND decided_by = ?`
        ).bind(now, a.id, now, me),
        db.prepare(
          `UPDATE hackathon_application SET status = 'withdrawn', decided_at = ?
            WHERE member_id = ? AND id != ? AND status = 'pending'
              AND EXISTS (SELECT 1 FROM hackathon_application WHERE id = ? AND status = 'approved' AND decided_at = ?)`
        ).bind(now, a.member_id, a.id, a.id, now),
        act(db, a.member_id, "approved", a.team_id, null, now)
      ]);
      changed = r[0].meta.changes;
    }
  } catch (e) {
    if (isUniqueError(e)) throw E.conflict("Pelamar sudah tergabung di tim lain", "applicant_in_team");
    throw e;
  }
  if (!changed) throw E.conflict("Lamaran sudah diputuskan atau melewati batas waktu", "not_pending_or_expired");
  return c.json({ id: a.id, status: b.status, decided_at: now });
}

export async function listBuilders(c) {
  const r = await c.db.prepare(
    `SELECT m.id AS member_id, m.nama, m.kota, p.jalur, p.jalur_override
       FROM hackathon_participant p JOIN hackathon_member m ON m.id = p.member_id
      WHERE p.jalur IS NOT NULL AND p.joined_main_at IS NOT NULL AND m.id != ?
        AND NOT EXISTS (SELECT 1 FROM hackathon_team_member tm WHERE tm.member_id = m.id AND tm.left_at IS NULL)
      ORDER BY p.updated_at DESC LIMIT 100`
  ).bind(c.member.id).all();
  return c.json({ builders: r.results.map(({ jalur, jalur_override, ...x }) => ({ ...x, jalur_aktif: jalurAktif({ jalur, jalur_override }) })) });
}

export async function inviteBuilder(c) {
  const t = await ownTeam(c, c.params.id), b = await readJson(c.req), now = c.now;
  if (t.status !== "open") throw E.conflict("Tim sudah ditutup", "team_closed");
  const target = str(b.member_id, "member_id", { max: 60, min: 1 });
  if (target === c.member.id) throw E.bad("Tidak bisa mengundang diri sendiri");
  const ok = await c.db.prepare(
    `SELECT 1 FROM hackathon_participant p WHERE p.member_id = ? AND p.joined_main_at IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM hackathon_team_member tm WHERE tm.member_id = p.member_id AND tm.left_at IS NULL)`
  ).bind(target).first();
  if (!ok) throw E.conflict("Builder tidak tersedia", "builder_unavailable");
  await c.db.batch([
    c.db.prepare("INSERT OR IGNORE INTO hackathon_invite (id, team_id, member_id, created_at) VALUES (?,?,?,?)").bind(newId("inv", now), t.id, target, now),
    act(c.db, c.member.id, "invite", t.id, { member_id: target }, now)
  ]);
  return c.json({ ok: true }, 201);
}

// anggota aktif; kontak hanya untuk anggota aktif dan hanya milik yang sudah setuju (atau milik sendiri)
export async function listMembers(c) {
  await requireActiveMember(c.db, c.params.id, c.member.id);
  const r = await c.db.prepare(
    `SELECT tm.member_id, tm.role, tm.joined_at, m.nama, m.wa, m.email, m.linkedin, m.github,
            p.jalur, p.jalur_override, p.contact_consent_at
       FROM hackathon_team_member tm
       JOIN hackathon_member m ON m.id = tm.member_id JOIN hackathon_participant p ON p.member_id = tm.member_id
      WHERE tm.team_id = ? AND tm.left_at IS NULL ORDER BY tm.joined_at`
  ).bind(c.params.id).all();
  return c.json({
    members: r.results.map((x) => {
      const o = { member_id: x.member_id, nama: x.nama, peran: x.jalur_override || x.jalur, role: x.role, joined_at: x.joined_at, me: x.member_id === c.member.id };
      if (x.contact_consent_at || o.me) o.contacts = { wa: x.wa, email: x.email, linkedin: x.linkedin, github: x.github };
      return o;
    })
  });
}
