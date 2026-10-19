const LOCALE = { id: "id-ID", en: "en-US", zh: "zh-CN" };

export function fmtTime(ms, lang) {
  try {
    return new Intl.DateTimeFormat(LOCALE[lang] || "id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(ms));
  } catch (e) { return ""; }
}
