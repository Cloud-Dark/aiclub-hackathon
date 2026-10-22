const LOCALE = { id: "id-ID", en: "en-US", zh: "zh-CN" };

// selisih jam server dan perangkat; hitung mundur memakai jam server (dipasang App dari server_time)
let skew = 0;
export const setSkew = (serverTime) => { if (Number.isFinite(serverTime)) skew = serverTime - Date.now(); };
export const nowMs = () => Date.now() + skew;

export function fmtTime(ms, lang) {
  try {
    return new Intl.DateTimeFormat(LOCALE[lang] || "id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(ms));
  } catch (e) { return ""; }
}
