import { URUT, WEIGHTS, CONFIG } from "../data.js";

export const total = () => Math.min(CONFIG.quizLen, WEIGHTS.length);

export function skor(jawab) {
  const s = {};
  URUT.forEach((k) => { s[k] = 0; });
  jawab.forEach((p, i) => {
    const w = WEIGHTS[i] && WEIGHTS[i][p];
    if (w) Object.keys(w).forEach((k) => { s[k] += w[k]; });
  });
  return s;
}
export function urutSkor(jawab) {
  const s = skor(jawab);
  return URUT.slice().sort((a, b) => s[b] - s[a]);
}
export const aktif = (st) => st.override || urutSkor(st.jawab)[0];
export function quizDone(jawab) {
  for (let i = 0; i < total(); i++) if (jawab[i] == null) return false;
  return true;
}
export const waValid = (v) => { const n = String(v).replace(/\D/g, "").length; return n >= 9 && n <= 15; };
export const identDone = (st) => st.nama.trim().length > 0 && st.kota.trim().length > 0 && waValid(st.wa);
export function reachable(st, step) {
  if (step <= 0) return true;
  if (step === 1) return identDone(st);
  return identDone(st) && quizDone(st.jawab);
}
