// demoOwner: tampilkan tombol simulasi keputusan owner (sampai ada backend sungguhan)
export const CONFIG = { modeDraft: false, quizLen: 6, demoOwner: true };
export const URUT = ["CEO", "CTO", "AI", "PM", "DSG", "GRW", "DOM", "DAT"];
export const WEIGHTS = [
  [{ DOM: 3, PM: 1 }, { PM: 3, AI: 1 }, { CTO: 3, AI: 1 }, { CEO: 3 }, { DAT: 3 }],
  [{ DSG: 3 }, { CTO: 2, AI: 1 }, { PM: 2, DSG: 2 }, { CEO: 2, GRW: 2 }],
  [{ AI: 3, CTO: 1 }, { AI: 2, DAT: 2 }, { PM: 2, CEO: 1 }, { DOM: 3 }],
  [{ CTO: 2, CEO: 1 }, { CEO: 3 }, { PM: 3 }, { GRW: 2, DSG: 1 }],
  [{ CEO: 3, GRW: 1 }, { CTO: 2, AI: 1 }, { DAT: 2, DOM: 2 }, { DSG: 2, PM: 1, GRW: 1 }],
  [{ CEO: 3 }, { CTO: 2, AI: 1 }, { DOM: 3 }, { GRW: 3 }, { DAT: 2, AI: 1 }]
];
export const LATAR = ["kerja-tech", "kerja-nontech", "mahasiswa", "freelance", "founder", "cari-kerja"];
export const WA_GROUP_URL = "https://chat.whatsapp.com/GNcd3TL3bZ71LoxlL8RzH9";

// akun dummy untuk halaman login aiclub.id (profil sengaja tidak lengkap)
export const DUMMY_USERS = [
  { email: "rani@aiclub.id", nama: "Rani Putri", kota: "", wa: "", linkedin: "" },
  { email: "bagas@aiclub.id", nama: "Bagas Pratama", kota: "Malang", wa: "", linkedin: "" },
  { email: "salsa@aiclub.id", nama: "Salsa Nadira", kota: "Bandung", wa: "", linkedin: "https://linkedin.com/in/salsa-nadira" }
];

export const WA_LINK_RE = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+/;

export const TIM = [
  { nama: "REKON", kota: "Jakarta", anggota: 3, ceo: "Raka", butuh: ["AI", "DAT"], wa: "" },
  { nama: "WARUNG TAP", kota: "Bandung", anggota: 2, ceo: "Sari", butuh: ["CTO", "DSG"], wa: "" },
  { nama: "SIAP RISIKO", kota: "Surabaya", anggota: 4, ceo: "Bintang", butuh: ["DOM", "PM"], wa: "" },
  { nama: "TANYA OPS", kota: "Yogyakarta", anggota: 2, ceo: "Nadia", butuh: ["AI", "GRW"], wa: "" },
  { nama: "ANTRE HABIS", kota: "Makassar", anggota: 3, ceo: "Fikri", butuh: ["DAT", "DSG"], wa: "" },
  { nama: "BACA KONTRAK", kota: "Medan", anggota: 2, ceo: "Ayu", butuh: ["DOM", "CTO"], wa: "" }
];
export const BUILDER = [
  { nama: "Dimas", kota: "Semarang", peran: "AI" }, { nama: "Lala", kota: "Denpasar", peran: "DSG" },
  { nama: "Hendra", kota: "Palembang", peran: "DOM" }, { nama: "Vina", kota: "Balikpapan", peran: "DAT" },
  { nama: "Arif", kota: "Pontianak", peran: "CTO" }, { nama: "Tari", kota: "Kupang", peran: "GRW" }
];
// pelamar contoh yang masuk ke tim buatan peserta (index ke BUILDER)
export const SEED_APPLICANTS = [0, 4];

export const SCREENS = ["intro", "login", "identitas", "kuis", "hasil", "grup", "pilih", "pasar", "buat", "dasbor"];
export const STEP_OF = { intro: -1, login: -1, identitas: 0, kuis: 1, hasil: 2, grup: 3, pilih: 3, pasar: 3, buat: 3, dasbor: 3 };

export const ICONS = {
  home: "M4 1h2v1h1v1h1v1h1v1H8v4H6V7H4v2H2V5H1V4h1V3h1V2h1z",
  user: "M3 1h4v1h1v3H7v1H3V5H2V2h1zM2 7h6v1h1v2H1V8h1z",
  quiz: "M3 0h4v1h1v3H7v1H6v2H4V4h1V3h1V2H4v1H2V1h1zM4 8h2v2H4z",
  path: "M1 1h3v3H1zM6 6h3v3H6zM4 2h4v1H4zM7 3h1v3H7zM2 4h1v4h3v1H2z",
  team: "M2 1h2v2H2zM6 1h2v2H6zM1 4h4v3H1zM5 4h4v3H5zM2 7h2v2H2zM6 7h2v2H6z"
};
