import id from "./id.js";
import en from "./en.js";
import zh from "./zh.js";

import auth from "./add_auth.js";
import teams from "./add_teams.js";
import dash from "./add_dash.js";
import ann from "./add_ann.js";

// kamus utama + tambahan per area (add_*.js); kunci tambahan menimpa/menambah kamus utama
const merge = (a, b) => {
  const o = { ...a };
  for (const k of Object.keys(b)) o[k] = b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && a[k] && typeof a[k] === "object" && !Array.isArray(a[k]) ? merge(a[k], b[k]) : b[k];
  return o;
};
const extras = [auth, teams, dash, ann];
const withExtras = (base, lang) => extras.reduce((acc, x) => merge(acc, x[lang] || {}), base);

export const I18N = { id: withExtras(id, "id"), en: withExtras(en, "en"), zh: withExtras(zh, "zh") };
export const LANGS = ["id", "en", "zh"];

export function detectLang() {
  try { const q = new URLSearchParams(location.search).get("lang"); if (q && I18N[q]) return q; } catch (e) {}
  try { const s = localStorage.getItem("hk_lang"); if (s && I18N[s]) return s; } catch (e) {}
  const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "id"];
  for (const l of list) {
    const c = String(l).toLowerCase();
    if (/^(id|ms|jv|su)/.test(c)) return "id";
    if (c.startsWith("zh")) return "zh";
    if (c.startsWith("en")) return "en";
  }
  return "en";
}

function pick(dict, path) {
  return path.split(".").reduce((o, p) => (o == null ? o : o[p]), dict);
}

export function makeT(lang) {
  const get = (path) => {
    const v = pick(I18N[lang], path);
    return v != null ? v : pick(I18N.id, path);
  };
  const t = (path, vars) => {
    let s = get(path);
    if (typeof s !== "string") return "";
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    return s;
  };
  return { t, get, role: (k) => get("roles." + k) || {} };
}
