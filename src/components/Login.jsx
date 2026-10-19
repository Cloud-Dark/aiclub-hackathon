import React, { useState } from "react";
import { Head } from "./Common.jsx";
import { DUMMY_USERS } from "../data.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ t, onBack, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState({});

  function submit(e) {
    e.preventDefault();
    const er = {};
    if (!EMAIL_RE.test(email.trim())) er.email = t("login.errEmail");
    if (!pass) er.pass = t("login.errPass");
    setErr(er);
    if (Object.keys(er).length) return;
    const em = email.trim().toLowerCase();
    const known = DUMMY_USERS.find((u) => u.email === em);
    const guess = em.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    onLogin(known || { email: em, nama: guess, kota: "", wa: "", linkedin: "" });
  }

  return (
    <section className="screen" style={{ maxWidth: 560, margin: "0 auto" }}>
      <Head prompt={t("login.prompt")} onBack={onBack} t={t} />
      <h2>{t("login.title")}</h2>
      <p className="lead" style={{ marginBottom: 14 }}>{t("login.body")}</p>
      <form className="card c" noValidate style={{ gap: 16 }} onSubmit={submit}>
        <span className="badge" style={{ background: "var(--yellow)" }}>{t("login.badge")}</span>
        <label className={"field" + (err.email ? " err" : "")}>
          <span>{t("login.email")}</span>
          <input type="email" inputMode="email" autoComplete="username" value={email} placeholder={t("login.emailPh")}
            aria-invalid={!!err.email} onChange={(e) => setEmail(e.target.value)} />
          {err.email && <span className="err-msg">{err.email}</span>}
        </label>
        <label className={"field" + (err.pass ? " err" : "")}>
          <span>{t("login.pass")}</span>
          <input type="password" autoComplete="current-password" value={pass} placeholder={t("login.passPh")}
            aria-invalid={!!err.pass} onChange={(e) => setPass(e.target.value)} />
          {err.pass && <span className="err-msg">{err.pass}</span>}
        </label>
        <button type="submit" className="btn primary">{t("login.submit")} <span aria-hidden="true">&rsaquo;</span></button>
      </form>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="kick c">{t("login.demoTitle")}</div>
        <div className="hist">
          {DUMMY_USERS.map((u) => (
            <button key={u.email} type="button" className="it demo-acc" onClick={() => onLogin(u)}>
              <span style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                <span className="px" style={{ fontSize: 9 }}>{u.nama}</span>
                <span className="mono" style={{ fontSize: 18, color: "var(--dim)" }}>{u.email}</span>
              </span>
              <span className="px" style={{ fontSize: 8, color: "var(--cyan)" }}>&rsaquo;</span>
            </button>
          ))}
        </div>
        <div className="note">{t("login.demoHint")}</div>
      </div>
    </section>
  );
}
