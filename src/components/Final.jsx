import React, { useEffect, useRef } from "react";
import { Head } from "./Common.jsx";
import { WA_GROUP_URL } from "../data.js";
import { urutSkor, aktif } from "../lib/scoring.js";
import { buildPayload, sendWebhook } from "../lib/webhook.js";

export function shareText(st, t, get, role) {
  const u = urutSkor(st.jawab);
  const a = aktif(st);
  const kedua = u.filter((k) => k !== a)[0];
  const m = (k) => t("final.msg." + k);
  const lines = [
    m("head"),
    "",
    `${m("name")}: ${st.nama.trim()}`,
    st.kota.trim() ? `${m("city")}: ${st.kota.trim()}` : null,
    st.email.trim() ? `${m("email")}: ${st.email.trim()}` : null,
    `${m("latar")}: ${get("identity.latar")[st.latar]}`,
    st.wa.trim() ? `${m("wa")}: ${st.wa.trim()}` : null,
    st.linkedin.trim() ? `${m("linkedin")}: ${st.linkedin.trim()}` : null,
    `${m("role")}: ${role(a).nama}`,
    `${m("role2")}: ${role(kedua).nama}`
  ];
  return lines.filter((l) => l != null).join("\n");
}

export default function Final({ st, patch, t, get, role, onBack, onRestart }) {
  const text = shareText(st, t, get, role);
  const shareUrl = "https://wa.me/?text=" + encodeURIComponent(text);
  const sentRef = useRef(false);

  // kirim ke webhook sekali per sesi lengkap, setelah peserta tiba di langkah terakhir
  useEffect(() => {
    if (sentRef.current || st.webhookSent) return;
    sentRef.current = true;
    const payload = buildPayload(st);
    sendWebhook(payload).then((ok) => { if (ok) patch({ webhookSent: true }); else sentRef.current = false; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="screen" style={{ maxWidth: 760, margin: "0 auto" }}>
      <Head prompt={t("final.prompt")} onBack={onBack} t={t} />
      <h2>{t("final.title")}</h2>
      <div className="stack" style={{ gap: 20 }}>
        <div className="card c" style={{ gap: 12 }}>
          <div className="kick c">{t("final.s1")}</div>
          <div className="role-main" style={{ color: "var(--ink)" }}>{t("final.s1t")}</div>
          <div className="txt">{t("final.s1b")}</div>
          <a className="btn gold cta-link" href={WA_GROUP_URL} target="_blank" rel="noopener noreferrer">{t("final.joinCta")} <span aria-hidden="true">&#9654;</span></a>
        </div>
        <div className="card y" style={{ gap: 12 }}>
          <div className="kick">{t("final.s2")}</div>
          <div className="role-main" style={{ color: "var(--ink)" }}>{t("final.s2t")}</div>
          <div className="txt">{t("final.s2b")}</div>
          <div className="kick c" style={{ marginTop: 4 }}>{t("final.previewTitle")}</div>
          <pre className="preview">{text}</pre>
          <a className="btn primary cta-link" href={shareUrl} target="_blank" rel="noopener noreferrer">{t("final.shareCta")} <span aria-hidden="true">&#9654;</span></a>
        </div>
      </div>
      <div className="actions">
        <button type="button" className="btn ghost btn-back" onClick={onBack}><span aria-hidden="true">&lsaquo;</span>{t("nav.back")}</button>
        <span className="hint">{t("final.done")}</span>
        <button type="button" className="link" onClick={onRestart}>{t("final.restart")}</button>
      </div>
    </section>
  );
}
