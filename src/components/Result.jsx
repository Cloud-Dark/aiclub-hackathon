import React from "react";
import Combo from "./Combo.jsx";
import { Head, Actions } from "./Common.jsx";
import { URUT, CONFIG } from "../data.js";
import { skor, urutSkor, aktif } from "../lib/scoring.js";

export default function Result({ st, patch, t, role, onNext, onBack, onRedo }) {
  const s = skor(st.jawab);
  const u = urutSkor(st.jawab);
  const a = aktif(st);
  const kedua = u.filter((k) => k !== a)[0];
  const mx = Math.max(1, s[u[0]]);
  const R = role(a);
  const canTeam = a === "CEO" || !CONFIG.modeDraft;
  const peranOpts = URUT.map((k) => ({ value: k, label: role(k).nama }));
  return (
    <section className="screen">
      <Head prompt={t("result.prompt")} onBack={onBack} t={t} />
      <div className="grid2 even">
        <div className="stack">
          <div className="card y" style={{ gap: 12 }}>
            <div className="kick">{t("result.main")}</div>
            <div className="role-main">{R.ringkas}</div>
            <div className="txt" style={{ fontSize: 21 }}>{R.desc}</div>
            <div style={{ borderTop: "2px solid var(--line)", marginTop: 4, paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="kick">{t("result.second")}</div>
              <div className="mono" style={{ fontSize: 21, color: "var(--cyan)" }}>{role(kedua).nama}</div>
            </div>
          </div>
          <div className="card">
            <div className="kick w">{t("result.fixTitle")}</div>
            <div className="txt">{t("result.fixBody")}</div>
            <div className="field">
              <Combo id="peran" label={t("result.fixTitle")} options={peranOpts} value={a} t={t} onChange={(v) => patch({ override: v })} />
            </div>
          </div>
        </div>
        <div className="stack">
          {CONFIG.showScore !== false && (
            <div className="card">
              <div className="kick c">{t("result.scoreTitle")}</div>
              {u.map((k) => (
                <div key={k} className="bar-row">
                  <span className="n">{role(k).ringkas}</span>
                  <span className="t"><i style={{ width: Math.round((s[k] / mx) * 100) + "%", background: k === a ? "var(--yellow)" : "#0E607A" }} /></span>
                  <span className="v">{s[k]}</span>
                </div>
              ))}
            </div>
          )}
          <div className="card">
            <div className="kick w">{t("result.openTitle")}</div>
            <div className="list">
              <span>&#9626; {canTeam ? t("result.openTeam") : t("result.openTeamLocked")}</span>
              <span>&#9626; {t("result.openApply", { role: R.ringkas })}</span>
              <span>&#9626; {t("result.openInvited")}</span>
              <span>&#9626; {t("result.openTraining")}</span>
            </div>
          </div>
        </div>
      </div>
      <Actions onBack={onBack} t={t} extra={<button type="button" className="link" onClick={onRedo}>{t("result.redo")}</button>}>
        <button type="button" className="btn gold" onClick={onNext}>{t("result.toGroup")} <span aria-hidden="true">&rsaquo;</span></button>
      </Actions>
    </section>
  );
}
