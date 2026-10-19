import React from "react";
import { Head, Actions } from "./Common.jsx";
import MyTeam from "./MyTeam.jsx";
import { ConfirmButton } from "./Widgets.jsx";
import { TIM, CONFIG, WA_GROUP_URL } from "../data.js";
import { aktif } from "../lib/scoring.js";
import { fmtTime } from "../lib/time.js";

const COLOR = { pending: "var(--yellow)", approved: "var(--cyan)", rejected: "var(--magenta)" };

export default function Dash({ st, t, get, role, actions, onBack }) {
  const a = aktif(st);
  const nm = st.nama.trim() ? st.nama.trim().toUpperCase() : t("dash.guest");
  const slug = (st.nama.trim() || "peserta").toLowerCase().replace(/\s+/g, "-");
  const stName = { pending: t("dash.appliedSt"), approved: t("dash.stApproved"), rejected: t("dash.stRejected") };
  const ket = { pending: t("dash.appliedKet"), approved: t("dash.approvedKet"), rejected: t("dash.rejectedKet") };
  const approvedN = st.apps.filter((x) => x.status === "approved").length;
  const rows = st.apps.length;
  const logs = st.log.slice().reverse();

  return (
    <section className="screen">
      <Head prompt={"status/" + slug} onBack={onBack} t={t} />
      <h2>{t("dash.greeting", { name: nm })}</h2>
      <div className="grid2">
        <div className="stack">
          <div className="card c">
            <div className="kick c">{t("dash.mainTitle")}</div>
            <div className="it-row">
              <span className="okline">&#9632; {t("dash.mainJoined")}</span>
              <a className="cbtn go" href={WA_GROUP_URL} target="_blank" rel="noopener noreferrer">{t("dash.mainOpen")}</a>
            </div>
          </div>

          {!st.myTeam && <div className="card">
            <div className="kick c">{t("dash.actsTitle")}</div>
            {rows ? (
              <div className="hist">
                {st.apps.map((ap) => {
                  const team = TIM.find((x) => x.nama === ap.team);
                  return (
                    <div key={ap.team} className="it" style={{ alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 180px", minWidth: 0 }}>
                        <span className="px" style={{ fontSize: 9 }}>{ap.team}</span>
                        <span className="mono" style={{ fontSize: 18, color: "var(--dim)" }}>{ket[ap.status]}</span>
                        {ap.status === "approved" && (team.wa
                          ? <a className="cbtn go" style={{ alignSelf: "flex-start", marginTop: 6 }} href={team.wa} target="_blank" rel="noopener noreferrer">{t("dash.joinTeam")}</a>
                          : <span className="note">{t("dash.noLink")}</span>)}
                        <button type="button" className="cbtn" style={{ alignSelf: "flex-start", marginTop: 6 }} onClick={() => actions.openDetail(ap.team)}>{t("market.viewDetail")}</button>
                        {ap.status === "approved" && <div style={{ marginTop: 6 }}><ConfirmButton label={t("choose.leaveTeam")} sure={t("choose.sure")} onConfirm={() => actions.leaveTeam(ap.team)} /></div>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        <span className="px" style={{ fontSize: 7, color: COLOR[ap.status] }}>{stName[ap.status]}</span>
                        {CONFIG.demoOwner && ap.status === "pending" && (
                          <div className="row-btns">
                            <button type="button" className="cbtn go" onClick={() => actions.decideApp(ap.team, "approved")}>{t("dash.simApprove")}</button>
                            <button type="button" className="cbtn" onClick={() => actions.decideApp(ap.team, "rejected")}>{t("dash.simReject")}</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <div className="empty">{t("dash.empty")}</div>}
            {CONFIG.demoOwner && <div className="note">{t("dash.demoNote")}</div>}
          </div>}

          {st.myTeam && <MyTeam st={st} t={t} get={get} role={role} actions={actions} />}

          <div className="card">
            <div className="kick c">{t("dash.logTitle")}</div>
            {logs.length ? (
              <div className="tl">
                {logs.map((l, i) => (
                  <div key={l.at + "-" + i} className="it">
                    <span className="dot" style={{ background: "var(--cyan)" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <span className="kick">{fmtTime(l.at, st.lang)}</span>
                      <span className="mono" style={{ fontSize: 19 }}>{t("dash.log." + l.k, { team: l.team, who: l.who })}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="empty">{t("dash.logEmpty")}</div>}
          </div>

          <div className="card">
            <div className="kick w">{t("dash.roadTitle")}</div>
            <div className="tl">
              {get("schedule").map((j, i) => {
                const c = i === 1 ? "var(--yellow)" : i === 0 ? "var(--cyan)" : "var(--faint)";
                return (
                  <div key={i} className="it">
                    <span className="dot" style={{ background: c }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <span className="kick" style={{ color: c }}>{j.minggu}</span>
                      <span className="mono" style={{ fontSize: 20 }}>{j.judul}</span>
                      <span className="mono" style={{ fontSize: 18, color: "var(--dim)", lineHeight: 1.25 }}>{j.ket}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="stack">
          <div className="card y"><div className="kick">{t("dash.formed")}</div><div className="big" style={{ fontSize: 56 }}>{11 + st.undang.length + approvedN + (st.myTeam ? 1 : 0)}</div><div className="txt" style={{ marginTop: -4 }}>{t("dash.formedBody")}</div></div>
          <div className="card"><div className="kick c">{t("dash.yourRole")}</div><div className="px" style={{ fontSize: 11, lineHeight: 1.6 }}>{role(a).ringkas}</div><div className="txt">{role(a).desc}</div></div>
          <div className="card"><div className="kick">{t("dash.challengeTitle")}</div><div className="txt">{t("dash.challengeBody")}</div></div>
        </div>
      </div>
      <Actions onBack={onBack} t={t} extra={<button type="button" className="link" onClick={actions.restart}>{t("dash.restart")}</button>}>
        <button type="button" className="btn gold" onClick={actions.toTencent}>{t("dash.toTencent")} <span aria-hidden="true">&rsaquo;</span></button>
        {!st.myTeam && <button type="button" className="btn ghost" onClick={actions.toMarketBack}>{t("dash.toMarket")}</button>}
        <button type="button" className="btn ghost" onClick={actions.toChoosePage}>{t("dash.changeChoice")}</button>
      </Actions>
    </section>
  );
}
