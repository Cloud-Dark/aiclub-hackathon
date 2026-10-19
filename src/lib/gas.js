import { GAS_URL, GAS_TOKEN } from "../data.js";

// Bentuk payload sama dengan yang dibaca apps-script/Code.gs (flat, partial update)
export function buildPayload(st) {
  const p = {
    id: st.pid || "",
    event: "selesai",
    nama: st.nama.trim(),
    kota: st.kota.trim(),
    email: st.email.trim(),
    wa: st.wa.trim(),
    linkedin: st.linkedin.trim(),
    latar: st.latar,
    lang: st.lang,
    jawab: st.jawab.slice(0, 6).map((v) => (v == null ? null : v)),
    override: st.override || ""
  };
  if (GAS_TOKEN) p.token = GAS_TOKEN;
  return p;
}

// Mengembalikan { ok, id, ... } dari Apps Script, atau null bila URL belum diisi / request gagal.
// text/plain menghindari preflight CORS (Apps Script tidak menangani OPTIONS).
export function sendToGas(payload) {
  if (!GAS_URL) return Promise.resolve(null);
  return fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(payload),
    keepalive: true
  })
    .then((r) => r.json())
    .catch(() => null);
}
