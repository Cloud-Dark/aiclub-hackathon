import React from "react";
import { I18N, LANGS } from "../i18n/index.js";
import { asset } from "./Brand.jsx";
import { ICONS, STEP_OF } from "../data.js";
import { total, reachable } from "../lib/scoring.js";
import { unreadCount } from "./Announcements.jsx";

const Icon = ({ d }) => <svg viewBox="0 0 10 10" shapeRendering="crispEdges" fill="currentColor"><path d={d} /></svg>;

export function Header({ st, t, setLang, onLogout, onAnn }) {
  const un = unreadCount(st);
  return (
    <>
      <header className={"top" + (st.user ? " has-user" : "")}>
        <div className="wrap">
          <div className="brand">
            <img className="logo-icon" src={asset("aiclub.png")} alt="AIClub.id" width="34" height="34" />
            <span className="px name">AICLUB<b>.ID</b></span>
            <span className="partners hdr-logos">
              <i>x</i><img src={asset("sumopod.png")} alt="SumoPod" height="18" />
              <i>x</i><img src={asset("tencent.png")} alt="" height="22" /><span className="px">TENCENT CLOUD</span>
            </span>
          </div>
          <div className="meta"><span>{t("top.open")}</span><span style={{ color: "var(--line)" }}>|</span><span className="c">{t("top.demo")}</span></div>
          <button type="button" className={"ann-btn" + (st.screen === "info" ? " on" : "")} onClick={onAnn} aria-label={t("ann.nav") + (un ? " · " + t("ann.unread", { n: un }) : "")}>
            <Icon d={ICONS.bell} /><span className="l">{t("ann.nav")}</span>{un > 0 && <b className="dot-n">{un}</b>}
          </button>
          {st.user && (
            <div className="user-chip" title={st.user.email}>
              <span className="as">{t("login.as")}</span><b>{st.user.nama}</b>
              <button type="button" onClick={onLogout}>{t("login.logout")}</button>
            </div>
          )}
          <div className="lang" role="group" aria-label={t("top.langLabel")}>
            {LANGS.map((k) => (
              <button key={k} type="button" lang={k} aria-pressed={k === st.lang} title={I18N[k].meta.name} onClick={() => setLang(k)}>{I18N[k].meta.label}</button>
            ))}
          </div>
        </div>
      </header>
      <div className="wrap">
        <div className="sub-meta"><span>{t("top.open")}</span><span className="c">{t("top.demo")}</span></div>
      </div>
    </>
  );
}

export function Stepper({ st, get, gotoStep }) {
  const cur = STEP_OF[st.screen];
  return (
    <nav className="stepper" aria-label="steps">
      {get("steps").map((s, i) => (
        <button key={i} type="button" className={i === cur ? "cur" : i < cur ? "done" : ""} disabled={!reachable(st, i)}
          aria-current={i === cur ? "step" : undefined} onClick={() => gotoStep(i)}>
          <span className="l">{s.label}</span><span className="k">{s.ket.replace("{n}", total())}</span>
        </button>
      ))}
    </nav>
  );
}

export function BottomNav({ st, t, get, gotoStep, onAnn }) {
  const un = unreadCount(st);
  const cur = STEP_OF[st.screen];
  const ic = [ICONS.user, ICONS.team, ICONS.path];
  return (
    <nav className="bnav" aria-label="steps">
      <button type="button" className={cur === -1 && st.screen !== "info" ? "cur" : ""} aria-current={cur === -1 && st.screen !== "info" ? "page" : undefined} onClick={() => gotoStep(-1)}>
        <Icon d={ICONS.home} /><span>{t("nav.home")}</span>
      </button>
      {get("steps").map((s, i) => (
        <button key={i} type="button" className={i === cur ? "cur" : i < cur ? "done" : ""}
          aria-disabled={reachable(st, i) ? undefined : "true"} aria-current={i === cur ? "step" : undefined} onClick={() => gotoStep(i)}>
          <Icon d={ic[i]} /><span>{s.label}</span>
        </button>
      ))}
      <button type="button" className={st.screen === "info" ? "cur" : ""} aria-current={st.screen === "info" ? "page" : undefined} onClick={onAnn}>
        <Icon d={ICONS.bell} /><span>{t("ann.nav")}</span>{un > 0 && <b className="dot-n">{un}</b>}
      </button>
    </nav>
  );
}
