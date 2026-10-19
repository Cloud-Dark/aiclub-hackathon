// Satu orang: jadi anggota satu tim ATAU owner satu tim, tidak keduanya.
export const approvedApp = (st) => st.apps.find((a) => a.status === "approved") || null;
export const pendingApps = (st) => st.apps.filter((a) => a.status === "pending");
// lamaran aktif = menunggu atau disetujui; hanya boleh satu pada satu waktu
export const activeApp = (st) => st.apps.find((a) => a.status === "pending" || a.status === "approved") || null;
export const canApply = (st) => !st.myTeam && !activeApp(st);
export const canCreate = (st) => !st.myTeam && !st.apps.some((a) => a.status === "pending" || a.status === "approved");
