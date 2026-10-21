import React from "react";
import { Head, Actions } from "./Common.jsx";
import { findTeam, teamDesc } from "../lib/share.js";
import { aktif } from "../lib/scoring.js";
import { activeApp, leftHM } from "../lib/rules.js";
import { teamMembers, teamMessages } from "../lib/team.js";
import TeamRoom from "./TeamRoom.jsx";

export default function TeamDetail({ st, t, get, role, actions, onBack }) {
  const tm = findTeam(st, st.viewTeam);
  if (!tm) return null;
  const a = aktif(st);
  const ap = st.apps.find((x) => x.team === tm.nama);
  const status = ap ? ap.status : null;
  const act = activeApp(st);
  const blocked = act && act.team !== tm.nama ? act : null;
  const cocok = tm.butuh.includes(a);
  const step = status === "approved" ? 3 : status === "pending" ? 2 : 1;
  const expired = ap && ap.reason === "expired";
  const stText = status === "approved" ? t("detail.sApproved") : status === "pending" ? t("detail.sPending") : expired ? t("deadline.expired") : status === "rejected" ? t("detail.sRejected") : t("detail.sNone");
  const stColor = status === "approved" ? "var(--cyan)" : status === "rejected" ? "var(--magenta)" : status ? "var(--yellow)" : "var(--muted)";
  const slug = tm.nama.toLowerCase().replace(/\s+/g, "-");

  let cta;
  if (status === "approved") {
    cta = tm.wa
      ? <a className="btn gold cta-link" href={tm.wa} target="_blank" rel="noopener noreferrer">{t("detail.join")} <span aria-hidden="true">&#9654;</span></a>
      : <button type="button" className="btn ghost" aria-disabled="true">{t("market.groupSoon")}</button>;
  } else if (status === "pending") {
    cta = <button type="button" className="btn ghost" onClick={() => actions.toggleApply(tm.nama)}>{t("market.withdraw")}</button>;
  } else if (status === "rejected") {
    cta = <button type="button" className="btn ghost" aria-disabled="true">{t("market.rejectedBtn")}</button>;
  } else if (blocked) {
    cta = <>
      <div className="lock-msg">{blocked.status === "approved" ? t("detail.inTeam", { team: blocked.team }) : t("detail.otherTeam", { team: blocked.team })}</div>
      <button type="button" className="btn ghost" aria-disabled="true">{t("market.apply")}</button>
    </>;
  } else {
    cta = <button type="button" className="btn primary" onClick={() => actions.toggleApply(tm.nama)}>{t("market.apply")} <span aria-hidden="true">&rsaquo;</span></button>;
  }

  return (
    <section className="screen" style={{ maxWidth: 860, margin: "0 auto" }}>
      <Head prompt={t("detail.prompt", { team: slug })} onBack={onBack} t={t} />
      <h2>{tm.nama}</h2>
      <p className="lead" style={{ marginBottom: 18, fontSize: 17 }}>{teamDesc(tm, get)}</p>

      <div className="grid2 even">
        <div className="stack">
          <div className={"card " + (cocok ? "c" : "")}>
            <div className="kick c">{t("detail.about")}</div>
            <dl className="facts">
              <div><dt>{t("detail.city")}</dt><dd>{tm.kota}</dd></div>
              <div><dt>{t("detail.members")}</dt><dd>{tm.anggota}</dd></div>
              <div><dt>{t("detail.owner")}</dt><dd>{tm.ceo}</dd></div>
              <div><dt>{t("detail.opened")}</dt><dd>{t("detail.days", { n: tm.hari })}</dd></div>
            </dl>
            <div className="slots">
              <span className="kick" style={{ fontSize: 7 }}>{t("detail.slots")}</span>
              <div className="tags">{tm.butuh.map((b) => <span key={b} className={"tag" + (b === a ? " m" : "")}>{role(b).ringkas}</span>)}</div>
              <div className="note" style={{ color: cocok ? "var(--cyan)" : "var(--faint)" }}>{cocok ? t("detail.matchYes") : t("detail.matchNo")}</div>
            </div>
          </div>

          <div className="card">
            <div className="kick w">{t("detail.how")}</div>
            <ol className="howto">
              {[t("detail.h1"), t("detail.h2"), t("detail.h3")].map((h, k) => (
                <li key={k} className={k + 1 < step ? "done" : k + 1 === step ? "cur" : ""}>
                  <span className="n">{k + 1 < step ? "✓" : k + 1}</span><span>{h}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="stack">
          <div className={"card " + (status === "approved" ? "y" : "")} style={{ gap: 12 }}>
            <div className="kick">{t("detail.group")}</div>
            <div className="role-main" style={{ color: "var(--ink)", fontSize: 14 }}>{t("detail.groupName", { team: tm.nama })}</div>
            <div className="mono" style={{ fontSize: 19, color: "var(--cyan)" }}>{t("detail.groupSize", { n: tm.grupN })}</div>
            <div className="txt">{t("detail.groupBody")}</div>
            <div className="status-line" style={{ color: stColor }}>&#9632; {stText}</div>
            {status === "pending" && <div className="note deadline">{t("deadline.left", leftHM(ap))}</div>}
            {status !== "approved" && <div className="locked-link" aria-label={t("detail.locked")}>&#128274; {t("detail.locked")}</div>}
            {cta}
          </div>
        </div>
      </div>
      {status === "approved"
        ? <TeamRoom st={st} t={t} role={role} team={tm} members={teamMembers(st, tm)} messages={teamMessages(st, tm, t)} onSend={(x) => actions.sendChat(tm.nama, x)} />
        : <div className="empty" style={{ marginTop: 18 }}>&#128274; {t("room.locked")}</div>}
      <Actions onBack={onBack} t={t}>
        <button type="button" className="btn ghost" onClick={onBack}>{t("detail.back")}</button>
      </Actions>
    </section>
  );
}
