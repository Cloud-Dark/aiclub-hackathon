import { ANGGOTA, BUILDER } from "../data.js";
import { aktif } from "./scoring.js";

const me = (st) => ({ nama: st.nama.trim(), peran: aktif(st), wa: st.wa, email: st.email, linkedin: st.linkedin, github: st.github, me: true });
export const isOwnTeam = (st, tm) => !!st.myTeam && tm.nama === st.myTeam.nama;

// anggota tim beserta kontak; dipanggil hanya untuk owner atau pelamar yang sudah disetujui
export function teamMembers(st, tm) {
  if (isOwnTeam(st, tm)) {
    return [{ ...me(st), owner: true }, ...st.applicants.filter((a) => a.status === "approved").map((a) => BUILDER[a.b])];
  }
  // tim dari link: kontak owner belum bisa diambil tanpa backend
  const base = tm.shared ? [{ nama: tm.ceo || "Owner", owner: true, noContact: true }] : (ANGGOTA[tm.nama] || []);
  return [...base, me(st)];
}

// pesan: sapaan owner (contoh) + pesan yang dikirim di perangkat ini
export function teamMessages(st, tm, t) {
  const own = (st.chats && st.chats[tm.nama]) || [];
  if (isOwnTeam(st, tm)) return own;
  const ap = st.apps.find((x) => x.team === tm.nama);
  const owner = teamMembers(st, tm).find((m) => m.owner);
  const hello = { who: owner ? owner.nama : "", text: t("room.welcome", { team: tm.nama }), at: (ap && (ap.decidedAt || ap.at)) || Date.now() };
  return [hello, ...own];
}
