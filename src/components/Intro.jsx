import React from "react";

export default function Intro({ t, onNext }) {
  return (
    <section className="screen grid2">
      <div className="stack" style={{ gap: 16 }}>
        <div className="prompt">&gt; {t("intro.prompt")}<span className="cursor" aria-hidden="true" /></div>
        <h1>{t("intro.title1")}<br />{t("intro.title2")}</h1>
        <div className="mono" style={{ fontSize: "clamp(20px,5.4vw,26px)", color: "var(--cyan)", marginTop: -4 }}>&gt; {t("intro.sub")}</div>
        <p className="lead">{t("intro.body")}</p>
        <div className="actions" style={{ marginTop: 12, border: 0, padding: 0, justifyContent: "flex-start" }}>
          <span className="cta-wrap">
            <button type="button" className="btn gold cta" onClick={onNext} style={{ width: "100%" }}>
              {t("intro.cta")} <span className="arrow" aria-hidden="true">&#9654;</span>
            </button>
          </span>
          <span className="hint" style={{ textAlign: "left", flexBasis: "auto" }}>{t("intro.ctaHint")}</span>
        </div>
      </div>
      <div className="stack">
        <div className="card"><div className="kick c">{t("intro.whyTitle")}</div><div className="txt">{t("intro.whyBody")}</div></div>
        <div className="card"><div className="kick">{t("intro.targetTitle")}</div><div className="big">120+</div><div className="txt" style={{ marginTop: -4 }}>{t("intro.targetBody")}</div></div>
      </div>
    </section>
  );
}
