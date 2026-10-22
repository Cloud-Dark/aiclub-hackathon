import React from "react";
import { Head, Actions } from "./Common.jsx";
import { TENCENT_SUBMIT_URL } from "../data.js";

export default function Submit({ st, patch, t, onBack }) {
  const ready = !!st.projectReady;
  return (
    <section className="screen" style={{ maxWidth: 760, margin: "0 auto" }}>
      <Head prompt={t("submit.prompt")} onBack={onBack} t={t} />
      <h2>{t("submit.title")}</h2>
      <p className="lead" style={{ marginBottom: 18 }}>{t("submit.body")}</p>
      <div className="card y" style={{ gap: 14 }}>
        <label className="check">
          <input type="checkbox" checked={ready} onChange={(e) => patch({ projectReady: e.target.checked })} />
          <span>{t("submit.ready")}</span>
        </label>
        {!ready && <div className="note">{t("submit.readyHint")}</div>}
        {ready ? (
          <a className="btn gold cta-link" href={TENCENT_SUBMIT_URL} target="_blank" rel="noopener noreferrer" onClick={() => patch({ submitClicked: true })}>
            {t("submit.cta")} <span aria-hidden="true">&#9654;</span>
          </a>
        ) : (
          <button type="button" className="btn gold" aria-disabled="true">{t("submit.cta")}</button>
        )}
        {st.submitClicked && <div className="okline">&#9632; {t("submit.sent")}</div>}
      </div>
      <Actions onBack={onBack} t={t}>
        <span />
      </Actions>
    </section>
  );
}
