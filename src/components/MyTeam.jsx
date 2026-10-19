import React, { useState } from "react";
import { URUT, BUILDER, WA_LINK_RE } from "../data.js";

export default function MyTeam({ st, t, get, role, actions }) {
  const m = (k, v) => t("dash.myTeam." + k, v);
  const team = st.myTeam;
  const [f, setF] = useState({ nama: "", desc: "", butuh: [], wa: "" });
  const [err, setErr] = useState({});
  const [link, setLink] = useState(team ? team.wa : "");
  const [linkErr, setLinkErr] = useState("");
  const [saved, setSaved] = useState(false);

  if (!team) {
    const create = (e) => {
      e.preventDefault();
      const er = {};
      if (!f.nama.trim()) er.nama = m("errName");
      if (!f.butuh.length) er.butuh = m("errSlot");
      if (f.wa.trim() && !WA_LINK_RE.test(f.wa.trim())) er.wa = m("errWa");
      setErr(er);
      if (Object.keys(er).length) return;
      actions.openTeam({ nama: f.nama.trim().toUpperCase(), desc: f.desc.trim(), kota: st.kota.trim(), butuh: f.butuh, wa: f.wa.trim() });
    };
    return (
      <form className="card" onSubmit={create} noValidate style={{ gap: 14 }}>
        <div className="kick c">{m("createTitle")}</div>
        <div className="txt">{m("createBody")}</div>
        <label className={"field" + (err.nama ? " err" : "")}>
          <span>{m("name")} *</span>
          <input value={f.nama} placeholder={m("namePh")} onChange={(e) => setF({ ...f, nama: e.target.value })} />
          {err.nama && <span className="err-msg">{err.nama}</span>}
        </label>
        <label className="field">
          <span>{m("desc")}</span>
          <input value={f.desc} placeholder={m("descPh")} onChange={(e) => setF({ ...f, desc: e.target.value })} />
        </label>
        <div className={"field" + (err.butuh ? " err" : "")}>
          <span>{m("slots")} *</span>
          <div className="tags">
            {URUT.map((k) => (
              <button key={k} type="button" className={"tag pick" + (f.butuh.includes(k) ? " on" : "")} aria-pressed={f.butuh.includes(k)}
                onClick={() => setF({ ...f, butuh: f.butuh.includes(k) ? f.butuh.filter((x) => x !== k) : [...f.butuh, k] })}>{role(k).ringkas}</button>
            ))}
          </div>
          {err.butuh && <span className="err-msg">{err.butuh}</span>}
        </div>
        <label className={"field" + (err.wa ? " err" : "")}>
          <span>{m("wa")}</span>
          <input type="url" inputMode="url" value={f.wa} placeholder={m("waPh")} onChange={(e) => setF({ ...f, wa: e.target.value })} />
          {err.wa && <span className="err-msg">{err.wa}</span>}
        </label>
        <div className="note">{m("waHint")}</div>
        <button type="submit" className="btn primary">{m("createBtn")}</button>
      </form>
    );
  }

  const saveLink = () => {
    const v = link.trim();
    if (v && !WA_LINK_RE.test(v)) { setLinkErr(m("errWa")); setSaved(false); return; }
    setLinkErr(""); actions.saveTeamLink(v); setSaved(true);
  };
  return (
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
  );
}
