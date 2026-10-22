// Skor jalur dihitung di server (salinan dari src/data.js + src/lib/scoring.js; ubah keduanya bersamaan).
export const URUT = ["CEO", "CTO", "AI", "PM", "DSG", "GRW", "DOM", "DAT"];
export const WEIGHTS = [
  [{ DOM: 3, PM: 1 }, { PM: 3, AI: 1 }, { CTO: 3, AI: 1 }, { CEO: 3 }, { DAT: 3 }],
  [{ DSG: 3 }, { CTO: 2, AI: 1 }, { PM: 2, DSG: 2 }, { CEO: 2, GRW: 2 }],
  [{ AI: 3, CTO: 1 }, { AI: 2, DAT: 2 }, { PM: 2, CEO: 1 }, { DOM: 3 }],
  [{ CTO: 2, CEO: 1 }, { CEO: 3 }, { PM: 3 }, { GRW: 2, DSG: 1 }],
  [{ CEO: 3, GRW: 1 }, { CTO: 2, AI: 1 }, { DAT: 2, DOM: 2 }, { DSG: 2, PM: 1, GRW: 1 }],
  [{ CEO: 3 }, { CTO: 2, AI: 1 }, { DOM: 3 }, { GRW: 3 }, { DAT: 2, AI: 1 }]
];
export const QUIZ_LEN = 6;
export const LATAR = ["kerja-tech", "kerja-nontech", "mahasiswa", "freelance", "founder", "cari-kerja"];

export const quizComplete = (jawab) =>
  Array.isArray(jawab) && jawab.length >= QUIZ_LEN && jawab.slice(0, QUIZ_LEN).every((p, i) => Number.isInteger(p) && p >= 0 && p < WEIGHTS[i].length);

// jalur teratas; urutan seri mengikuti URUT (sort stabil), sama dengan klien
export function jalurOf(jawab) {
  if (!quizComplete(jawab)) return null;
  const s = Object.fromEntries(URUT.map((k) => [k, 0]));
  jawab.slice(0, QUIZ_LEN).forEach((p, i) => { for (const [k, v] of Object.entries(WEIGHTS[i][p])) s[k] += v; });
  return URUT.slice().sort((a, b) => s[b] - s[a])[0];
}
