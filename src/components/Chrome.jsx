import React from "react";
import { I18N, LANGS } from "../i18n/index.js";
import { ICONS, STEP_OF } from "../data.js";
import { total, reachable } from "../lib/scoring.js";

const Icon = ({ d }) => <svg viewBox="0 0 10 10" shapeRendering="crispEdges" fill="currentColor"><path d={d} /></svg>;

export function Header({ st, t, setLang, onLogout }) {
  return (
    <>
      <header className={"top" + (st.user ? " has-user" : "")}>
        <div className="wrap">
          <div className="brand">
            <svg width="22" height="22" viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden="true">
              <rect x="2" y="0" width="4" height="1" fill="#00E5FF" /><rect x="1" y="1" width="6" height="1" fill="#00E5FF" />
              <rect x="0" y="2" width="3" height="2" fill="#00E5FF" /><rect x="5" y="2" width="3" height="2" fill="#00E5FF" />
              <rect x="1" y="4" width="6" height="1" fill="#00E5FF" /><rect x="2" y="5" width="4" height="1" fill="#00E5FF" />
              <rect x="3" y="6" width="2" height="2" fill="#00E5FF" /><rect x="3" y="2" width="2" height="2" fill="#FFE500" />
            </svg>
            <span className="px name">AICLUB<b>.ID</b></span>
            <span className="px partners"><i>x</i>SUMOPOD<i>x</i>TENCENT CLOUD</span>
          </div>
          <div className="meta"><span>{t("top.open")}</span><span style={{ color: "var(--line)" }}>|</span><span className="c">{t("top.demo")}</span></div>
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

export function BottomNav({ st, t, get, gotoStep }) {
  const cur = STEP_OF[st.screen];
  const ic = [ICONS.user, ICONS.quiz, ICONS.path, ICONS.team];
  return (
    <nav className="bnav" aria-label="steps">
      <button type="button" className={cur === -1 ? "cur" : ""} aria-current={cur === -1 ? "page" : undefined} onClick={() => gotoStep(-1)}>
        <Icon d={ICONS.home} /><span>{t("nav.home")}</span>
      </button>
      {get("steps").map((s, i) => (
        <button key={i} type="button" className={i === cur ? "cur" : i < cur ? "done" : ""}
          aria-disabled={reachable(st, i) ? undefined : "true"} aria-current={i === cur ? "step" : undefined} onClick={() => gotoStep(i)}>
          <Icon d={ic[i]} /><span>{s.label}</span>
        </button>
      ))}
    </nav>
  );
}
