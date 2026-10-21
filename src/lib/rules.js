import { CONFIG } from "../data.js";

// Satu orang: jadi anggota satu tim ATAU owner satu tim, tidak keduanya.
export const approvedApp = (st) => st.apps.find((a) => a.status === "approved") || null;
export const pendingApps = (st) => st.apps.filter((a) => a.status === "pending");
// lamaran aktif = menunggu atau disetujui; hanya boleh satu pada satu waktu
export const activeApp = (st) => st.apps.find((a) => a.status === "pending" || a.status === "approved") || null;
export const canApply = (st) => !st.myTeam && !activeApp(st);
export const canCreate = (st) => !st.myTeam && !st.apps.some((a) => a.status === "pending" || a.status === "approved");

// Batas keputusan owner: lamaran yang masih menunggu lebih dari CONFIG.approveHours ditolak otomatis.
export const DEADLINE_MS = CONFIG.approveHours * 3600000;
export const deadlineOf = (x) => (x.at || 0) + DEADLINE_MS;
export const msLeft = (x, now = Date.now()) => Math.max(0, deadlineOf(x) - now);
// kembalikan list yang sama bila tidak ada yang kedaluwarsa (supaya tidak memicu render)
export function expirePending(list, now = Date.now()) {
  if (!list.some((x) => x.status === "pending" && deadlineOf(x) <= now)) return list;
  return list.map((x) => (x.status === "pending" && deadlineOf(x) <= now ? { ...x, status: "rejected", reason: "expired", decidedAt: deadlineOf(x) } : x));
}
// sisa waktu sebagai {h, m} untuk teks
export function leftHM(x, now = Date.now()) {
  const m = Math.ceil(msLeft(x, now) / 60000);
  return { h: Math.floor(m / 60), m: m % 60 };
}
