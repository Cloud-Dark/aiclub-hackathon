import React, { useState } from "react";
import { Head, Actions } from "./Common.jsx";
import { URUT, WA_LINK_RE } from "../data.js";

export default function Create({ st, t, role, actions, onBack }) {
  const m = (k) => t("dash.myTeam." + k);
  const [f, setF] = useState({ nama: "", desc: "", butuh: [], wa: "" });
  const [err, setErr] = useState({});

  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const er = {};
    if (!f.nama.trim()) er.nama = m("errName");
    if (!f.butuh.length) er.butuh = m("errSlot");
    if (f.wa.trim() && !WA_LINK_RE.test(f.wa.trim())) er.wa = m("errWa");
    setErr(er);
    if (Object.keys(er).length) return;
    if (busy) return;
    setBusy(true);
    try { await actions.createTeam({ nama: f.nama.trim().toUpperCase(), desc: f.desc.trim(), kota: st.kota.trim(), butuh: f.butuh, wa: f.wa.trim() }); }
    finally { setBusy(false); }
  }

  return (
    <section className="screen" style={{ maxWidth: 680, margin: "0 auto" }}>
      <Head prompt={t("create.prompt")} onBack={onBack} t={t} />
      <h2>{t("create.title")}</h2>
      <form className="stack" noValidate onSubmit={submit} style={{ gap: 18 }}>
        <div className="card" style={{ gap: 14 }}>
          <div className="kick c">{t("create.s1")}</div>
          <label className={"field" + (err.nama ? " err" : "")}>
            <span>{m("name")} *</span>
            <input value={f.nama} maxLength={40} placeholder={m("namePh")} onChange={(e) => { setF({ ...f, nama: e.target.value }); setErr({ ...err, nama: "" }); }} />
            {err.nama && <span className="err-msg">{err.nama}</span>}
          </label>
          <label className="field">
            <span>{m("desc")}</span>
            <input value={f.desc} maxLength={200} placeholder={m("descPh")} onChange={(e) => setF({ ...f, desc: e.target.value })} />
          </label>
        </div>
        <div className="card" style={{ gap: 14 }}>
          <div className="kick c">{t("create.s2")}</div>
          <div className={"field" + (err.butuh ? " err" : "")}>
            <span>{m("slots")} *</span>
            <div className="tags">
              {URUT.map((k) => (
                <button key={k} type="button" className={"tag pick" + (f.butuh.includes(k) ? " on" : "")} aria-pressed={f.butuh.includes(k)}
                  onClick={() => { setF({ ...f, butuh: f.butuh.includes(k) ? f.butuh.filter((x) => x !== k) : [...f.butuh, k] }); setErr({ ...err, butuh: "" }); }}>{role(k).ringkas}</button>
              ))}
            </div>
            {err.butuh && <span className="err-msg">{err.butuh}</span>}
          </div>
        </div>
        <div className="card" style={{ gap: 14 }}>
          <div className="kick c">{t("create.s3")}</div>
          <label className={"field" + (err.wa ? " err" : "")}>
            <span>{m("wa")}</span>
            <input type="url" inputMode="url" value={f.wa} placeholder={m("waPh")} onChange={(e) => { setF({ ...f, wa: e.target.value }); setErr({ ...err, wa: "" }); }} />
            {err.wa && <span className="err-msg">{err.wa}</span>}
          </label>
          <div className="note">{m("waHint")}</div>
        </div>
        <Actions onBack={onBack} t={t}>
          <button type="submit" className="btn primary" disabled={busy}>{m("createBtn")} <span aria-hidden="true">&rsaquo;</span></button>
        </Actions>
      </form>
    </section>
  );
}
