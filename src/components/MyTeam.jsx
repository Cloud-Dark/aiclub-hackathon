import React, { useRef, useState } from "react";
import { BUILDER, WA_LINK_RE } from "../data.js";
import { ConfirmButton } from "./Widgets.jsx";
import { teamLink } from "../lib/share.js";

// owner membagikan link tim; yang membuka link bisa melamar ke tim ini
function ShareTeam({ st, t, role }) {
  const m = (k, v) => t("dash.myTeam." + k, v);
  const team = st.myTeam;
  const url = teamLink(team, st.nama.trim());
  const text = m("shareMsg", { team: team.nama, slots: team.butuh.map((b) => role(b).ringkas).join(", ") });
  const [copy, setCopy] = useState("");
  const inp = useRef();
  async function doCopy() {
    try { await navigator.clipboard.writeText(url); setCopy("ok"); }
    catch (e) { if (inp.current) inp.current.select(); setCopy("fail"); }
  }
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  return (
    <div className="card c" style={{ gap: 12 }}>
      <div className="kick c">{m("shareTitle")}</div>
      <div className="txt">{m("shareBody")}</div>
      <input ref={inp} className="share-url mono" readOnly value={url} aria-label={m("shareTitle")} onFocus={(e) => e.target.select()} />
      <div className="row-btns">
        <button type="button" className="cbtn go" onClick={doCopy}>{m("copy")}</button>
        <a className="cbtn" href={"https://wa.me/?text=" + encodeURIComponent(text + "\n" + url)} target="_blank" rel="noopener noreferrer">{m("shareWa")}</a>
        {canShare && <button type="button" className="cbtn" onClick={() => navigator.share({ title: team.nama, text, url }).catch(() => {})}>{m("shareMore")}</button>}
        {copy === "ok" && <span className="okline" role="status">&#9632; {m("copied")}</span>}
      </div>
      {copy === "fail" && <span className="err-msg" role="status">{m("copyFail")}</span>}
      <div className="note">{m("shareDemo")}</div>
    </div>
  );
}

// panel owner: link grup, pelamar masuk, undang builder, tutup tim
export default function MyTeam({ st, t, get, role, actions }) {
  const m = (k, v) => t("dash.myTeam." + k, v);
  const team = st.myTeam;
  const [link, setLink] = useState(team.wa);
  const [linkErr, setLinkErr] = useState("");
  const [saved, setSaved] = useState(false);

  const saveLink = () => {
    const v = link.trim();
    if (v && !WA_LINK_RE.test(v)) { setLinkErr(m("errWa")); setSaved(false); return; }
    setLinkErr(""); actions.saveTeamLink(v); setSaved(true);
  };
  return (
    <>
      <div className="card y" style={{ gap: 14 }}>
        <div className="kick">{m("title")}</div>
        <div className="px" style={{ fontSize: 11, lineHeight: 1.6 }}>{team.nama}</div>
        {team.desc && <div className="txt">{team.desc}</div>}
        <div className="tags">{team.butuh.map((b) => <span key={b} className="tag m">{role(b).ringkas}</span>)}</div>

        <div className={"field" + (linkErr ? " err" : "")}>
          <span>{m("wa")}</span>
          <input type="url" inputMode="url" value={link} placeholder={m("waPh")} onChange={(e) => { setLink(e.target.value); setSaved(false); }} />
          {linkErr && <span className="err-msg">{linkErr}</span>}
          <div className="row-btns">
            <button type="button" className="cbtn go" onClick={saveLink}>{m("save")}</button>
            {saved && <span className="okline">&#9632; {m("saved")}</span>}
          </div>
        </div>

        <div className="kick c" style={{ marginTop: 6 }}>{m("inbox")}</div>
        {st.applicants.length === 0 ? (
          <div className="empty">{m("noApplicants")}</div>
        ) : (
          <div className="hist">
            {st.applicants.map((ap, i) => {
              const b = BUILDER[ap.b];
              const col = ap.status === "approved" ? "var(--cyan)" : ap.status === "rejected" ? "var(--magenta)" : "var(--yellow)";
              return (
                <div key={b.nama} className="it" style={{ alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: "1 1 180px" }}>
                    <span className="px" style={{ fontSize: 9 }}>{b.nama} <span className="mono" style={{ fontSize: 17, color: "var(--dim)" }}>· {b.kota}</span></span>
                    <span className="tag m" style={{ alignSelf: "flex-start" }}>{role(b.peran).ringkas}</span>
                    <span className="mono" style={{ fontSize: 18, color: "var(--dim)", lineHeight: 1.25 }}>{get("builders")[ap.b]}</span>
                  </div>
                  {ap.status === "pending" ? (
                    <div className="row-btns">
                      <button type="button" className="cbtn go" onClick={() => actions.decideApplicant(i, "approved")}>{m("approve")}</button>
                      <button type="button" className="cbtn" onClick={() => actions.decideApplicant(i, "rejected")}>{m("reject")}</button>
                    </div>
                  ) : (
                    <span className="px" style={{ fontSize: 7, color: col }}>{m(ap.status)}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {!team.wa && st.applicants.some((x) => x.status === "approved") && <div className="note">{m("noLink")}</div>}
      </div>

      <ShareTeam st={st} t={t} role={role} />

      <div className="card">
        <div className="kick c">{t("dash.inviteTitle")}</div>
        <div className="note">{t("dash.inviteBody")}</div>
        <div className="hist">
          {BUILDER.map((b, i) => {
            const sudah = st.undang.includes(b.nama);
            return (
              <div key={b.nama} className="it" style={{ alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: "1 1 180px" }}>
                  <span className="px" style={{ fontSize: 9 }}>{b.nama} <span className="mono" style={{ fontSize: 17, color: "var(--dim)" }}>· {b.kota}</span></span>
                  <span className="tag" style={{ alignSelf: "flex-start" }}>{role(b.peran).ringkas}</span>
                  <span className="mono" style={{ fontSize: 18, color: "var(--dim)", lineHeight: 1.25 }}>{get("builders")[i]}</span>
                </div>
                <button type="button" className={"cbtn " + (sudah ? "sent" : "")} onClick={() => actions.toggleInvite(b.nama)}>{sudah ? m("invited") : m("invite")}</button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <ConfirmButton label={m("close")} sure={t("choose.sure")} onConfirm={actions.closeTeam} />
      </div>
    </>
  );
}
