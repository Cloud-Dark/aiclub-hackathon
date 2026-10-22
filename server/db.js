// Query bersama untuk beberapa modul route.
import { E } from "./util.js";
import { quizComplete, jalurOf } from "./scoring.js";
import { waValid } from "./util.js";

export const APPROVE_MS = 24 * 3600000; // batas keputusan owner (APPROVE_HOURS = 24), hanya diatur di server

const jalurAktif = (p) => (p && (p.jalur_override || p.jalur)) || null;
export { jalurAktif };

// Lamaran pending yang lewat batas menjadi expired (dipanggil dari cek-saat-baca; tidak bergantung cron).
export function expireDue(db, now) {
  return db.batch([
    db.prepare(
      `INSERT INTO hackathon_activity (id, member_id, kind, team_id, meta, created_at)
       SELECT 'act_' || lower(hex(randomblob(10))), member_id, 'expired', team_id, id, expires_at
         FROM hackathon_application WHERE status = 'pending' AND expires_at <= ?`
    ).bind(now),
    db.prepare(
      `UPDATE hackathon_application SET status = 'expired', decided_at = expires_at
        WHERE status = 'pending' AND expires_at <= ?`
    ).bind(now)
  ]);
}

export const getParticipant = (db, id) => db.prepare("SELECT * FROM hackathon_participant WHERE member_id = ?").bind(id).first();
export const activeMembership = (db, id) =>
  db.prepare(
    `SELECT tm.team_id, tm.role, tm.joined_at, t.nama, t.status, t.owner_id
       FROM hackathon_team_member tm JOIN hackathon_team t ON t.id = tm.team_id
      WHERE tm.member_id = ? AND tm.left_at IS NULL`
  ).bind(id).first();
export const memberRole = async (db, teamId, memberId) =>
  (await db.prepare("SELECT role FROM hackathon_team_member WHERE team_id = ? AND member_id = ? AND left_at IS NULL").bind(teamId, memberId).first())?.role || null;

export async function requireActiveMember(db, teamId, memberId) {
  const role = await memberRole(db, teamId, memberId);
  if (!role) throw E.forbid("Hanya anggota aktif tim ini yang bisa mengakses");
  return role;
}

// syarat langkah 1 portal: data diri lengkap, kuis selesai, sudah gabung grup utama
export function prerequisitesMet(member, p) {
  return !!(member.nama && member.kota && waValid(member.wa)) && quizComplete(JSON.parse(p.jawaban || "[]")) && !!p.joined_main_at;
}
export function requirePrerequisites(member, p) {
  if (!prerequisitesMet(member, p)) throw E.conflict("Lengkapi data diri, kuis, dan gabung grup utama terlebih dahulu", "prerequisites");
}

export function profileOf(m) {
  return { member_id: m.id, email: m.email, nama: m.nama, kota: m.kota, wa: m.wa, linkedin: m.linkedin, github: m.github, role: m.role };
}
export function participantOf(p) {
  const jawaban = JSON.parse(p.jawaban || "[]");
  return {
    latar: p.latar, jawaban, jalur: p.jalur, jalur_override: p.jalur_override, jalur_aktif: jalurAktif(p),
    quiz_done: quizComplete(jawaban),
    contact_consent: !!p.contact_consent_at, contact_consent_at: p.contact_consent_at,
    joined_main_at: p.joined_main_at, tencent_clicked_at: p.tencent_clicked_at,
    project_ready_at: p.project_ready_at, submit_clicked_at: p.submit_clicked_at
  };
}
export { jalurOf };
