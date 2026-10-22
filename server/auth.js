// Akun sendiri: sandi PBKDF2, session cookie HttpOnly, token disimpan sebagai hash.
import { E, randomToken } from "./util.js";

export const COOKIE = "hk_session";
export const SESSION_MS = 30 * 86400000;
const ITER = 100000; // batas PBKDF2 di Workers

const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
const unhex = (s) => Uint8Array.from(s.match(/../g) || [], (h) => parseInt(h, 16));

export async function sha256(text) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}
export async function hashPassword(pw, saltHex) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: unhex(saltHex), iterations: ITER }, key, 256);
  return hex(bits);
}
export const newSalt = () => hex(crypto.getRandomValues(new Uint8Array(16)));
export function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export const isAdminEmail = (env, email) =>
  String(env.ADMIN_EMAILS || "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean).includes(email);

export function readCookie(req, name) {
  const m = (req.headers.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(name + "="));
  return m ? m.slice(name.length + 1) : null;
}
export function cookieHeader(url, value, maxAge) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${url.protocol === "https:" ? "; Secure" : ""}`;
}

export async function createSession(db, memberId, now) {
  const token = randomToken();
  await db.prepare("INSERT INTO hackathon_session (token_hash, member_id, created_at, expires_at) VALUES (?,?,?,?)")
    .bind(await sha256(token), memberId, now, now + SESSION_MS).run();
  // bersihkan session kedaluwarsa milik member ini
  await db.prepare("DELETE FROM hackathon_session WHERE member_id = ? AND expires_at <= ?").bind(memberId, now).run();
  return token;
}

// member dari cookie, atau null
export async function sessionMember(req, db, now) {
  const token = readCookie(req, COOKIE);
  if (!token || token.length > 100) return null;
  return db.prepare(
    `SELECT m.* FROM hackathon_session s JOIN hackathon_member m ON m.id = s.member_id
      WHERE s.token_hash = ? AND s.expires_at > ?`
  ).bind(await sha256(token), now).first();
}
export async function destroySession(req, db) {
  const token = readCookie(req, COOKIE);
  if (token) await db.prepare("DELETE FROM hackathon_session WHERE token_hash = ?").bind(await sha256(token)).run();
}

export async function throttleLogin(db, email, now) {
  const since = now - 15 * 60000;
  const r = await db.prepare("SELECT COUNT(*) n FROM hackathon_login_attempt WHERE email = ? AND at > ?").bind(email, since).first();
  if (r.n >= 8) throw E.limit("Terlalu banyak percobaan masuk, coba lagi 15 menit lagi");
}
export const recordFailedLogin = (db, email, now) =>
  db.batch([
    db.prepare("INSERT INTO hackathon_login_attempt (email, at) VALUES (?,?)").bind(email, now),
    db.prepare("DELETE FROM hackathon_login_attempt WHERE at < ?").bind(now - 86400000)
  ]);
