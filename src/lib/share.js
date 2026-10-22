// Link undangan tim: ?tim=<share_code> (acak, dicari server). Tanpa data tim di URL.
export const teamLink = (code) => location.origin + location.pathname + "?tim=" + encodeURIComponent(code);

// baca ?tim= dari URL sekali saat aplikasi dibuka, lalu bersihkan URL; undefined bila tidak ada
export function readInviteCode() {
  try {
    const p = new URLSearchParams(location.search);
    if (!p.has("tim")) return undefined;
    const code = p.get("tim");
    p.delete("tim");
    const q = p.toString();
    history.replaceState(null, "", location.pathname + (q ? "?" + q : "") + location.hash);
    return /^[a-z0-9]{10,32}$/.test(code) ? code : null;
  } catch (e) { return undefined; }
}

export const allTeams = (st) => st.teams;
export const findTeam = (st, nama) => st.teams.find((x) => x.nama === nama) || null;
export const teamDesc = (tm) => tm.desc || "";
