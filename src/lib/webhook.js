import { WEBHOOK_URL } from "../data.js";
import { skor, urutSkor, aktif } from "./scoring.js";

export function buildPayload(st) {
  const u = urutSkor(st.jawab);
  const a = aktif(st);
  return {
    event: "hackathon_registration_completed",
    submittedAt: new Date().toISOString(),
    lang: st.lang,
    participant: {
      nama: st.nama.trim(),
      kota: st.kota.trim(),
      email: st.email.trim(),
      whatsapp: st.wa.trim(),
      linkedin: st.linkedin.trim(),
      latar: st.latar
    },
    quiz: { jawaban: st.jawab, skor: skor(st.jawab) },
    role: { terdeteksi: u[0], dipilih: a, override: st.override }
  };
}

export function sendWebhook(payload) {
  if (!WEBHOOK_URL) return Promise.resolve(false);
  // text/plain menghindari preflight CORS; kebanyakan webhook tetap bisa parse JSON dari body
  return fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(payload),
    keepalive: true
  }).then((r) => r.ok).catch(() => false);
}
