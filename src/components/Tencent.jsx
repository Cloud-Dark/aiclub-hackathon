import React from "react";
import { Head, Actions } from "./Common.jsx";
import { TENCENT_REGISTER_URL } from "../data.js";
import { activeApp } from "../lib/rules.js";

export default function Tencent({ st, patch, t, onNext, onBack, actions }) {
  const ap = activeApp(st);
  let teamMsg, tone;
  if (st.myTeam) { teamMsg = t("tencent.teamOwner", { team: st.myTeam.nama }); tone = "var(--cyan)"; }
  else if (ap && ap.status === "approved") { teamMsg = t("tencent.teamMember", { team: ap.team }); tone = "var(--cyan)"; }
  else if (ap) { teamMsg = t("tencent.teamPending", { team: ap.team }); tone = "var(--yellow)"; }
  else { teamMsg = t("tencent.teamNone"); tone = "var(--magenta)"; }
  const hasTeam = st.myTeam || (ap && ap.status === "approved");

  return (
    <section className="screen" style={{ maxWidth: 760, margin: "0 auto" }}>
      <Head prompt={t("tencent.prompt")} onBack={onBack} t={t} />
      <h2>{t("tencent.title")}</h2>
      <p className="lead" style={{ marginBottom: 18 }}>{t("tencent.body")}</p>
      <div className="stack" style={{ gap: 18 }}>
        <div className="card">
          <div className="kick c">{t("tencent.teamTitle")}</div>
          <div className="txt" style={{ color: tone }}>&#9632; {teamMsg}</div>
          {!hasTeam && <button type="button" className="btn ghost" onClick={actions.toTeamStep}>{t("tencent.toTeam")}</button>}
        </div>
        <div className="card y" style={{ gap: 12 }}>
          <a className="btn gold cta-link" href={TENCENT_REGISTER_URL} target="_blank" rel="noopener noreferrer" onClick={() => patch({ tencentClicked: true })}>
            {t("tencent.cta")} <span aria-hidden="true">&#9654;</span>
          </a>
          {st.tencentClicked && <div className="okline">&#9632; {t("tencent.opened")}</div>}
          <div className="note">{t("tencent.hint")}</div>
        </div>
        <div className="note">{t("tencent.later")}</div>
      </div>
      <Actions onBack={onBack} t={t}>
        <button type="button" className="btn primary" onClick={onNext}>{t("tencent.next")} <span aria-hidden="true">&rsaquo;</span></button>
      </Actions>
    </section>
  );
}
