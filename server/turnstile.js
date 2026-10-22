// Cloudflare Turnstile: hanya dipakai di login dan register. Bila TURNSTILE_SECRET belum diset, verifikasi dilewati (dev lokal).
import { ApiError } from "./util.js";

export async function verifyTurnstile(env, token, request) {
  if (!env.TURNSTILE_SECRET) return;
  const fail = () => new ApiError(400, "captcha_failed", "Verifikasi captcha gagal, muat ulang lalu coba lagi");
  if (typeof token !== "string" || !token || token.length > 2048) throw fail();
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) body.set("remoteip", ip);
  let r;
  try {
    r = await (await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body })).json();
  } catch { throw new ApiError(503, "captcha_unavailable", "Layanan captcha tidak bisa dihubungi, coba lagi"); }
  if (!r.success) throw fail();
}
