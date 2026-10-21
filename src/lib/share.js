import { TIM, URUT } from "../data.js";

// Link undangan tim: data tim dikodekan di URL (?tim=...) karena belum ada backend.
// Link grup WhatsApp tim sengaja TIDAK ikut, supaya tetap terkunci sampai owner menyetujui.
const ID_RE = /^[a-z0-9]{6,12}$/;
const MAX = { n: 40, d: 200, k: 60, o: 60 };

export const newTeamId = () => Math.random().toString(36).slice(2, 10).padEnd(8, "0");

function b64url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function unb64url(s) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodeTeam(team, owner) {
  return b64url(JSON.stringify({ id: team.id, n: team.nama, d: team.desc || "", k: team.kota || "", b: team.butuh, o: owner || "", at: team.at || Date.now() }));
}

// null bila kode rusak atau isinya tidak lolos validasi
export function decodeTeam(code) {
  try {
    if (!code || code.length > 1200) return null;
    const x = JSON.parse(unb64url(code));
    const str = (v, max) => typeof v === "string" && v.length <= max;
    if (!x || !ID_RE.test(x.id) || !str(x.n, MAX.n) || !x.n.trim() || !str(x.d, MAX.d) || !str(x.k, MAX.k) || !str(x.o, MAX.o)) return null;
    if (!Array.isArray(x.b) || !x.b.length || !x.b.every((r) => URUT.includes(r))) return null;
    const at = Number.isFinite(x.at) && x.at <= Date.now() ? x.at : Date.now();
    return { id: x.id, nama: x.n.trim().toUpperCase(), desc: x.d.trim(), kota: x.k.trim(), butuh: [...new Set(x.b)], ceo: x.o.trim(), at, shared: true };
  } catch (e) {
    return null;
  }
}

export function teamLink(team, owner) {
  const base = location.origin + location.pathname;
  return base + "?tim=" + encodeTeam(team, owner);
}

// baca ?tim= dari URL sekali saat aplikasi dibuka, lalu bersihkan URL
export function readInviteFromUrl() {
  try {
    const p = new URLSearchParams(location.search);
    if (!p.has("tim")) return undefined;
    const code = p.get("tim");
    p.delete("tim");
    const q = p.toString();
    history.replaceState(null, "", location.pathname + (q ? "?" + q : "") + location.hash);
    return decodeTeam(code);
  } catch (e) {
    return undefined;
  }
}

const DAY = 86400000;
// tim contoh + tim yang masuk lewat link, dalam satu bentuk
export function allTeams(st) {
  const shared = (st.sharedTeams || []).map((x) => ({
    ...x, anggota: 1, wa: "", grupN: 1, hari: Math.max(0, Math.floor((Date.now() - x.at) / DAY))
  }));
  return [...TIM, ...shared];
}
export const findTeam = (st, nama) => allTeams(st).find((x) => x.nama === nama) || null;
// deskripsi: tim contoh dari kamus bahasa, tim dari link dari isian owner
export function teamDesc(tm, get) {
  if (tm.shared) return tm.desc;
  const i = TIM.indexOf(tm);
  return i >= 0 ? get("teams")[i] : "";
}
