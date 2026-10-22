import { nowMs } from "./time.js";

// Satu orang: anggota satu tim ATAU owner satu tim. Aturan sebenarnya dijaga server; ini hanya untuk tampilan.
export const approvedApp = (st) => st.apps.find((a) => a.status === "approved") || null;
export const pendingApps = (st) => st.apps.filter((a) => a.status === "pending");
export const activeApp = (st) => st.apps.find((a) => a.status === "pending" || a.status === "approved") || null;
export const canApply = (st) => !st.myTeam && !activeApp(st);
export const canCreate = (st) => !st.myTeam && !activeApp(st);

// batas keputusan owner: expires_at dari server
export const msLeft = (x, now = nowMs()) => Math.max(0, (x.expires_at || 0) - now);
export function leftHM(x, now = nowMs()) {
  const m = Math.ceil(msLeft(x, now) / 60000);
  return { h: Math.floor(m / 60), m: m % 60 };
}
