import React from "react";
import { Head, Actions } from "./Common.jsx";
import { allTeams, teamDesc } from "../lib/share.js";
import { aktif } from "../lib/scoring.js";
import { activeApp } from "../lib/rules.js";

export default function Market({ st, t, get, role, actions, onNext, onBack }) {
  const a = aktif(st);
  const act = activeApp(st);
  const appOf = (n) => st.apps.find((x) => x.team === n);

  return (
    <section className="screen">
      <div className="mhead">
        <div style={{ minWidth: 0 }}>
          <Head prompt={t("market.prompt")} onBack={onBack} t={t} />
          <h2 style={{ margin: 0 }}>{t("market.titleDraft")}</h2>
        </div>
        <div className="chip"><span className="mono" style={{ fontSize: 18, color: "var(--dim)" }}>{t("market.asRole")}</span><span className="px" style={{ fontSize: 9, color: "var(--yellow)" }}>{role(a).ringkas}</span></div>
      </div>
      <div className="note" style={{ marginBottom: 14 }}>{t("market.hint")}</div>
      <div className="cards">
        {allTeams(st).map((tm) => {
          const ap = appOf(tm.nama);
          const cocok = tm.butuh.includes(a);
          const status = ap ? ap.status : null;
          const stLabel = status === "approved" ? t("market.stApproved") : ap && ap.reason === "expired" ? t("deadline.auto") : status === "rejected" ? t("market.stRejected") : status === "pending" ? t("market.stSent") : cocok ? t("market.stMatch") : t("market.stOpen");
          const stColor = status === "approved" ? "var(--cyan)" : status === "rejected" ? "var(--magenta)" : status ? "var(--yellow)" : cocok ? "var(--cyan)" : "var(--faint)";
          let btn;
          if (status === "approved") btn = <button type="button" className="cbtn go" onClick={() => actions.openTeamGroup(tm)}>{tm.wa ? t("market.openGroup") : t("market.groupSoon")}</button>;
          else if (status === "rejected") btn = <button type="button" className="cbtn off" aria-disabled="true">{t("market.rejectedBtn")}</button>;
          else if (act && !status) btn = <button type="button" className="cbtn off" aria-disabled="true" onClick={() => actions.toggleApply(tm.nama)}>{act.status === "approved" ? t("market.shortMember") : t("market.appliedElsewhere")}</button>;
          else btn = <button type="button" className={"cbtn " + (status ? "sent" : cocok ? "go" : "")} onClick={() => actions.toggleApply(tm.nama)}>{status ? t("market.withdraw") : t("market.apply")}</button>;
          return (
            <article key={tm.nama} className={"card tcard " + (cocok ? "c" : "")}>
              <div className="hd"><span className="nm">{tm.nama}{tm.shared && <span className="tag m via">{t("market.viaLink")}</span>}</span><span className="st" style={{ color: stColor }}>{stLabel}</span></div>
              <div className="txt" style={{ fontSize: 20 }}>{teamDesc(tm, get)}</div>
              <div className="info"><span>{tm.kota}</span><i>|</i><span>{t("market.members", { n: tm.anggota })}</span><i>|</i><span>{t("market.ceo", { name: tm.ceo })}</span></div>
              <div className="slots"><span className="kick" style={{ fontSize: 7 }}>{t("market.slots")}</span><div className="tags">{tm.butuh.map((b) => <span key={b} className={"tag" + (b === a ? " m" : "")}>{role(b).ringkas}</span>)}</div></div>
              <div className="cbtn-row">
                <button type="button" className="cbtn" onClick={() => actions.openDetail(tm.nama)}>{t("market.viewDetail")}</button>
                {btn}
              </div>
            </article>
          );
        })}
      </div>
      <Actions onBack={onBack} t={t} extra={<span className="hint">{t("market.summary", { a: st.apps.filter((x) => x.status !== "rejected").length })}</span>}>
        <button type="button" className="btn primary" onClick={onNext}>{t("market.toStatus")} <span aria-hidden="true">&rsaquo;</span></button>
      </Actions>
    </section>
  );
}
