import id from "./id.js";
import en from "./en.js";
import zh from "./zh.js";

export const I18N = { id, en, zh };
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
