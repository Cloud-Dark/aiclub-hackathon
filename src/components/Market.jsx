import React from "react";
import { Head, Actions } from "./Common.jsx";
import { TIM, BUILDER, CONFIG } from "../data.js";
import { aktif } from "../lib/scoring.js";

export default function Market({ st, patch, t, get, role, actions, onNext, onBack }) {
  const a = aktif(st);
  const ok = a === "CEO" || !CONFIG.modeDraft;
  const appOf = (n) => st.apps.find((x) => x.team === n);
  const mine = st.myTeam;

  let body;
  if (st.tab === "tim") {
    body = (
      <div className="cards">
        {mine && (
          <article className="card tcard y">
            <div className="hd"><span className="nm">{mine.nama}</span><span className="st" style={{ color: "var(--yellow)" }}>{t("market.yourTeam")}</span></div>
            <div className="txt" style={{ fontSize: 20 }}>{mine.desc || "—"}</div>
            <div className="info"><span>{mine.kota || "—"}</span><i>|</i><span>{t("market.members", { n: 1 + st.applicants.filter((x) => x.status === "approved").length })}</span><i>|</i><span>{t("market.ceo", { name: st.nama.trim() || t("dash.guest") })}</span></div>
            <div className="slots"><span className="kick" style={{ fontSize: 7 }}>{t("market.slots")}</span><div className="tags">{mine.butuh.map((b) => <span key={b} className={"tag" + (b === a ? " m" : "")}>{role(b).ringkas}</span>)}</div></div>
            <button type="button" className="cbtn off" aria-disabled="true">{t("market.youOwner")}</button>
          </article>
        )}
        {TIM.map((tm, i) => {
          const ap = appOf(tm.nama);
          const cocok = tm.butuh.includes(a);
          const status = ap ? ap.status : null;
          const stLabel = status === "approved" ? t("market.stApproved") : status === "rejected" ? t("market.stRejected") : status === "pending" ? t("market.stSent") : cocok ? t("market.stMatch") : t("market.stOpen");
          const stColor = status === "approved" ? "var(--cyan)" : status === "rejected" ? "var(--magenta)" : status ? "var(--yellow)" : cocok ? "var(--cyan)" : "var(--faint)";
          let btn;
          if (status === "approved") btn = <button type="button" className="cbtn go" onClick={() => actions.openTeamGroup(tm)}>{tm.wa ? t("market.openGroup") : t("market.groupSoon")}</button>;
          else if (status === "rejected") btn = <button type="button" className="cbtn off" aria-disabled="true">{t("market.rejectedBtn")}</button>;
          else btn = <button type="button" className={"cbtn " + (status ? "sent" : cocok ? "go" : "")} onClick={() => actions.toggleApply(tm.nama)}>{status ? t("market.withdraw") : t("market.apply")}</button>;
          return (
            <article key={tm.nama} className={"card tcard " + (cocok ? "c" : "")}>
              <div className="hd"><span className="nm">{tm.nama}</span><span className="st" style={{ color: stColor }}>{stLabel}</span></div>
              <div className="txt" style={{ fontSize: 20 }}>{get("teams")[i]}</div>
              <div className="info"><span>{tm.kota}</span><i>|</i><span>{t("market.members", { n: tm.anggota })}</span><i>|</i><span>{t("market.ceo", { name: tm.ceo })}</span></div>
              <div className="slots"><span className="kick" style={{ fontSize: 7 }}>{t("market.slots")}</span><div className="tags">{tm.butuh.map((b) => <span key={b} className={"tag" + (b === a ? " m" : "")}>{role(b).ringkas}</span>)}</div></div>
              {btn}
            </article>
          );
        })}
      </div>
    );
  } else {
    body = (
      <div className="cards">
        {BUILDER.map((b, i) => {
          const sudah = st.undang.includes(b.nama);
          const w = b.peran === a ? "var(--magenta)" : "var(--cyan)";
          return (
            <article key={b.nama} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="av" style={{ borderColor: w, color: w }}>{b.nama.charAt(0)}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}><span className="px" style={{ fontSize: 10 }}>{b.nama}</span><span className="mono" style={{ fontSize: 17, color: "var(--dim)" }}>{b.kota}</span></div>
              </div>
              <span className="badge" style={{ background: w }}>{role(b.peran).ringkas}</span>
              <div className="txt" style={{ fontSize: 20 }}>{get("builders")[i]}</div>
              <button type="button" className={"cbtn " + (!ok ? "off" : sudah ? "sent" : "")} aria-disabled={!ok ? "true" : undefined} onClick={() => actions.toggleInvite(b.nama, ok)}>
                {!ok ? t("market.needCeo") : sudah ? t("market.invited") : t("market.invite")}
              </button>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <section className="screen">
      <div className="mhead">
        <div style={{ minWidth: 0 }}>
          <Head prompt={t("market.prompt")} onBack={onBack} t={t} />
          <h2 style={{ margin: 0 }}>{CONFIG.modeDraft ? t("market.titleDraft") : t("market.titleTwoWay")}</h2>
        </div>
        <div className="chip"><span className="mono" style={{ fontSize: 18, color: "var(--dim)" }}>{t("market.asRole")}</span><span className="px" style={{ fontSize: 9, color: "var(--yellow)" }}>{role(a).ringkas}</span></div>
      </div>
      <div className="note" style={{ marginBottom: 14 }}>{t("market.hint")}</div>
      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={st.tab === "tim"} onClick={() => patch({ tab: "tim" })}>{t("market.tabTeams")}</button>
        <button type="button" role="tab" aria-selected={st.tab === "builder"} onClick={() => patch({ tab: "builder" })}>{t("market.tabBuilders")}</button>
      </div>
      {body}
      <Actions onBack={onBack} t={t} extra={<span className="hint">{t("market.summary", { a: st.apps.length, b: st.undang.length })}</span>}>
        <button type="button" className="btn primary" onClick={onNext}>{t("market.toStatus")} <span aria-hidden="true">&rsaquo;</span></button>
      </Actions>
    </section>
  );
}
