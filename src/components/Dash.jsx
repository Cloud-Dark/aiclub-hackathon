import React from "react";
import { Head, Actions } from "./Common.jsx";
import MyTeam from "./MyTeam.jsx";
import { ConfirmButton } from "./Widgets.jsx";
import { Prize, Challenges } from "./EventInfo.jsx";
import { WA_GROUP_URL } from "../data.js";
import TeamRoom from "./TeamRoom.jsx";
import { aktif } from "../lib/scoring.js";
import { fmtTime } from "../lib/time.js";
import { leftHM } from "../lib/rules.js";
import { AnnTeaser } from "./Announcements.jsx";

const COLOR = { pending: "var(--yellow)", approved: "var(--cyan)", rejected: "var(--magenta)" };

export default function Dash({ st, t, get, role, actions, onBack }) {
  const a = aktif(st);
  const nm = st.nama.trim() ? st.nama.trim().toUpperCase() : t("dash.guest");
  const slug = (st.nama.trim() || "peserta").toLowerCase().replace(/\s+/g, "-");
  const stName = { pending: t("dash.appliedSt"), approved: t("dash.stApproved"), rejected: t("dash.stRejected") };
  const ket = { pending: t("dash.appliedKet"), approved: t("dash.approvedKet"), rejected: t("dash.rejectedKet") };
  const rows = st.apps.length;
  const logs = st.log.slice().reverse();

  return (
    <section className="screen">
      <Head prompt={"status/" + slug} onBack={onBack} t={t} />
      <h2>{st.myTeam || st.memberTeam ? t("dash.greetingTeam", { name: nm, team: (st.myTeam || st.memberTeam).nama }) : t("dash.greeting", { name: nm })}</h2>
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
                  const wa = st.memberTeam && st.memberTeam.id === ap.team_id ? st.memberTeam.wa : "";
                  return (
                    <div key={ap.id} className="it" style={{ alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 180px", minWidth: 0 }}>
                        <span className="px" style={{ fontSize: 9 }}>{ap.team}</span>
                        <span className="mono" style={{ fontSize: 18, color: "var(--dim)" }}>{ap.reason === "expired" ? t("deadline.expired") : ket[ap.status]}</span>
                        {ap.status === "pending" && <span className="note deadline">{t("deadline.left", leftHM(ap))}</span>}
                        {ap.status === "approved" && (wa
                          ? <a className="cbtn go" style={{ alignSelf: "flex-start", marginTop: 6 }} href={wa} target="_blank" rel="noopener noreferrer">{t("dash.joinTeam")}</a>
                          : <span className="note">{t("dash.noLink")}</span>)}
                        <button type="button" className="cbtn" style={{ alignSelf: "flex-start", marginTop: 6 }} onClick={() => actions.openDetail(ap.team)}>{t("market.viewDetail")}</button>
                        {ap.status === "approved" && <div style={{ marginTop: 6 }}><ConfirmButton label={t("choose.leaveTeam")} sure={t("choose.sure")} onConfirm={() => actions.leaveTeam()} /></div>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        <span className="px" style={{ fontSize: 7, color: COLOR[ap.status] }}>{ap.reason === "expired" ? t("deadline.auto") : stName[ap.status]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <div className="empty">{t("dash.empty")}</div>}
          </div>}

          {st.myTeam && <MyTeam st={st} t={t} get={get} role={role} actions={actions} />}
          {!st.myTeam && st.memberTeam && <TeamRoom st={st} t={t} role={role} team={st.memberTeam} isOwner={false} actions={actions} />}

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
          <AnnTeaser st={st} t={t} get={get} onOpen={actions.openAnnFrom} onAll={actions.toAnnouncements} />
          <Prize t={t} />
          <div className="card"><div className="kick c">{t("dash.yourRole")}</div><div className="px" style={{ fontSize: 11, lineHeight: 1.6 }}>{role(a).ringkas}</div><div className="txt">{role(a).desc}</div></div>
          <Challenges get={get} t={t} compact />
        </div>
      </div>
      <Actions onBack={onBack} t={t}>
        <button type="button" className="btn gold" onClick={actions.toTencent}>{t("dash.toTencent")} <span aria-hidden="true">&rsaquo;</span></button>
        {!st.myTeam && <button type="button" className="btn ghost" onClick={actions.toMarketBack}>{t("dash.toMarket")}</button>}
        <button type="button" className="btn ghost" onClick={actions.toChoosePage}>{t("dash.changeChoice")}</button>
      </Actions>
    </section>
  );
}
