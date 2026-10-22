import React from "react";
import { Head } from "./Common.jsx";
import { ConfirmButton } from "./Widgets.jsx";
import { approvedApp, pendingApps, canCreate } from "../lib/rules.js";

export default function Choose({ st, t, actions, onBack }) {
  const owner = st.myTeam;
  const member = st.memberTeam ? { team: st.memberTeam.nama } : approvedApp(st);
  const pending = pendingApps(st);
  const inJoin = !owner && st.apps.length > 0;
  const createOk = canCreate(st);

  let joinCard;
  if (owner) {
    joinCard = (
      <>
        <div className="lock">{t("choose.lockedOwner", { team: owner.nama })}</div>
        <ConfirmButton label={t("choose.closeTeam")} sure={t("choose.sure")} onConfirm={actions.closeTeam} />
      </>
    );
  } else {
    joinCard = (
      <button type="button" className="btn primary" onClick={actions.chooseJoin}>
        {inJoin ? t("choose.continueJoin") : t("choose.joinCta")} <span aria-hidden="true">&rsaquo;</span>
      </button>
    );
  }

  let createCard;
  if (owner) {
    createCard = (
      <button type="button" className="btn gold" onClick={actions.goDash}>{t("choose.continueCreate")} <span aria-hidden="true">&rsaquo;</span></button>
    );
  } else if (member) {
    createCard = (
      <>
        <div className="lock">{t("choose.lockedMember", { team: member.team })}</div>
        <ConfirmButton label={t("choose.leaveTeam")} sure={t("choose.sure")} onConfirm={() => actions.leaveTeam()} />
      </>
    );
  } else if (!createOk) {
    createCard = (
      <>
        <div className="lock">{t("choose.lockedPending", { n: pending.length })}</div>
        <ConfirmButton label={t("choose.withdrawAll")} sure={t("choose.sure")} onConfirm={actions.withdrawAll} />
      </>
    );
  } else {
    createCard = (
      <button type="button" className="btn gold" onClick={actions.chooseCreate}>{t("choose.createCta")} <span aria-hidden="true">&rsaquo;</span></button>
    );
  }

  return (
    <section className="screen" style={{ maxWidth: 860, margin: "0 auto" }}>
      <Head prompt={t("choose.prompt")} onBack={onBack} t={t} />
      <h2>{t("choose.title")}</h2>
      <p className="lead" style={{ marginBottom: 18 }}>{t("choose.body")}</p>
      <div className="choice">
        <div className={"card" + (inJoin ? " now" : "")} style={{ gap: 12 }}>
          {inJoin && <span className="badge" style={{ background: "var(--yellow)" }}>{t("choose.now")}</span>}
          <div className="kick c">A</div>
          <div className="role-main" style={{ color: "var(--ink)" }}>{t("choose.joinTitle")}</div>
          <div className="txt">{t("choose.joinBody")}</div>
          {joinCard}
        </div>
        <div className={"card" + (owner ? " now" : "")} style={{ gap: 12 }}>
          {owner && <span className="badge" style={{ background: "var(--yellow)" }}>{t("choose.now")}</span>}
          <div className="kick">B</div>
          <div className="role-main" style={{ color: "var(--ink)" }}>{t("choose.createTitle")}</div>
          <div className="txt">{t("choose.createBody")}</div>
          {createCard}
        </div>
      </div>
    </section>
  );
}
