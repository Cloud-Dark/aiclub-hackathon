import React from "react";
import { Head, Actions } from "./Common.jsx";
import { WA_GROUP_URL } from "../data.js";
import { urutSkor, aktif } from "../lib/scoring.js";

export function shareText(st, t, get, role) {
  const u = urutSkor(st.jawab);
  const a = aktif(st);
  const kedua = u.filter((k) => k !== a)[0];
  const m = (k) => t("group.msg." + k);
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

export default function Group({ st, patch, t, get, role, actions, onBack }) {
  const text = shareText(st, t, get, role);
  const shareUrl = "https://wa.me/?text=" + encodeURIComponent(text);
  return (
    <section className="screen" style={{ maxWidth: 760, margin: "0 auto" }}>
      <Head prompt={t("group.prompt")} onBack={onBack} t={t} />
      <h2>{t("group.title")}</h2>
      <div className="stack" style={{ gap: 20 }}>
        <div className="card c" style={{ gap: 12 }}>
          <div className="kick c">{t("group.s1")}</div>
          <div className="role-main" style={{ color: "var(--ink)" }}>{t("group.s1t")}</div>
          <div className="txt">{t("group.s1b")}</div>
          <a className="btn gold cta-link" href={WA_GROUP_URL} target="_blank" rel="noopener noreferrer" onClick={() => patch({ clickedMain: true })}>
            {t("group.joinCta")} <span aria-hidden="true">&#9654;</span>
          </a>
          {st.joinedMain ? (
            <div className="okline">&#9632; {t("group.joined")}</div>
          ) : (
            <>
              <button type="button" className="btn primary" aria-disabled={!st.clickedMain} onClick={actions.confirmMain}>
                {t("group.confirm")}
              </button>
              {!st.clickedMain && <div className="note">{t("group.confirmHint")}</div>}
            </>
          )}
        </div>
        <div className="card y" style={{ gap: 12 }}>
          <div className="kick">{t("group.s2")}</div>
          <div className="role-main" style={{ color: "var(--ink)" }}>{t("group.s2t")}</div>
          <div className="txt">{t("group.s2b")}</div>
          <div className="kick c" style={{ marginTop: 4 }}>{t("group.previewTitle")}</div>
          <pre className="preview">{text}</pre>
          <a className="btn primary cta-link" href={shareUrl} target="_blank" rel="noopener noreferrer">
            {t("group.shareCta")} <span aria-hidden="true">&#9654;</span>
          </a>
        </div>
      </div>
      <Actions onBack={onBack} t={t}>
        <button type="button" className="btn gold" aria-disabled={!st.joinedMain} onClick={actions.toChoose}>
          {t("group.next")} <span aria-hidden="true">&rsaquo;</span>
        </button>
      </Actions>
    </section>
  );
}
