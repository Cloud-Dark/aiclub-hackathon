import React, { useEffect, useRef, useState } from "react";
import { Head } from "./Common.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TS_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TS_LANG = { id: "id", en: "en", zh: "zh-cn" };

// muat skrip Turnstile sekali (idempoten)
let tsPromise = null;
function loadTurnstile() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!tsPromise) {
    tsPromise = new Promise((resolve, reject) => {
      let s = document.querySelector('script[data-turnstile="1"]');
      if (!s) {
        s = document.createElement("script");
        s.src = TS_SRC; s.async = true; s.defer = true; s.dataset.turnstile = "1";
        document.head.appendChild(s);
      }
      s.addEventListener("load", () => resolve(window.turnstile));
      s.addEventListener("error", () => { tsPromise = null; s.remove(); reject(new Error("turnstile load")); });
    });
  }
  return tsPromise;
}

export default function Login({ t, st, onBack, onAuth }) {
  const [mode, setMode] = useState("login");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState({});
  const [formErr, setFormErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");
  const boxRef = useRef(null);
  const widRef = useRef(null);
  const sitekey = (st && st.config && st.config.turnstile_sitekey) || "";
  const lang = st ? st.lang : "id";
  const reg = mode === "register";

  useEffect(() => {
    if (!sitekey || !boxRef.current) return undefined;
    let dead = false;
    setToken("");
    loadTurnstile().then((ts) => {
      if (dead || !ts || !boxRef.current) return;
      widRef.current = ts.render(boxRef.current, {
        sitekey, theme: "dark", language: TS_LANG[lang] || "en",
        callback: (tk) => setToken(tk),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken("")
      });
    }).catch(() => {});
    return () => {
      dead = true;
      try { if (widRef.current != null && window.turnstile) window.turnstile.remove(widRef.current); } catch (e) {}
      widRef.current = null;
    };
  }, [sitekey, mode, lang]);

  function resetCaptcha() {
    setToken("");
    try { if (widRef.current != null && window.turnstile) window.turnstile.reset(widRef.current); } catch (e) {}
  }

  function switchMode(m) {
    if (busy || m === mode) return;
    setMode(m); setErr({}); setFormErr("");
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const er = {};
    if (reg && !nama.trim()) er.nama = t("login.errNama");
    if (!EMAIL_RE.test(email.trim())) er.email = t("login.errEmail");
    if (!pass) er.pass = t("login.errPass");
    else if (reg && (pass.length < 8 || pass.length > 128)) er.pass = t("login.errPassLen");
    setErr(er); setFormErr("");
    if (Object.keys(er).length) return;
    if (sitekey && !token) { setFormErr(t("login.errCaptcha")); return; }
    const payload = { email: email.trim().toLowerCase(), password: pass, turnstile_token: sitekey ? token : "" };
    if (reg) payload.nama = nama.trim();
    setBusy(true);
    try {
      await onAuth(mode, payload);
    } catch (x) {
      setFormErr(x && x.code === "captcha_failed" ? t("login.errCaptchaFailed") : (x && x.message) || t("login.errGeneric"));
      if (sitekey) resetCaptcha();
      setBusy(false);
    }
  }

  return (
    <section className="screen" style={{ maxWidth: 560, margin: "0 auto" }}>
      <Head prompt={t("login.prompt")} onBack={onBack} t={t} />
      <h2>{reg ? t("login.titleRegister") : t("login.title")}</h2>
      <p className="lead" style={{ marginBottom: 14 }}>{t("login.body")}</p>
      <div className="tabs auth-tabs" role="group" aria-label={t("login.tabsLabel")}>
        <button type="button" className={mode === "login" ? "on" : ""} aria-selected={mode === "login"} disabled={busy} onClick={() => switchMode("login")}>{t("login.tabLogin")}</button>
        <button type="button" className={reg ? "on" : ""} aria-selected={reg} disabled={busy} onClick={() => switchMode("register")}>{t("login.tabRegister")}</button>
      </div>
      <form className="card c" noValidate style={{ gap: 16 }} onSubmit={submit} aria-busy={busy}>
        <span className="badge" style={{ background: "var(--yellow)" }}>{t("login.badge")}</span>
        {reg && (
          <label className={"field" + (err.nama ? " err" : "")}>
            <span>{t("login.nama")}</span>
            <input type="text" autoComplete="name" maxLength={100} value={nama} placeholder={t("login.namaPh")}
              aria-invalid={!!err.nama} disabled={busy} onChange={(e) => setNama(e.target.value)} />
            {err.nama && <span className="err-msg">{err.nama}</span>}
          </label>
        )}
        <label className={"field" + (err.email ? " err" : "")}>
          <span>{t("login.email")}</span>
          <input type="email" inputMode="email" autoComplete="username" value={email} placeholder={t("login.emailPh")}
            aria-invalid={!!err.email} disabled={busy} onChange={(e) => setEmail(e.target.value)} />
          {err.email && <span className="err-msg">{err.email}</span>}
        </label>
        <label className={"field" + (err.pass ? " err" : "")}>
          <span>{t("login.pass")}</span>
          <input type="password" autoComplete={reg ? "new-password" : "current-password"} maxLength={128} value={pass} placeholder={t("login.passPh")}
            aria-invalid={!!err.pass} aria-describedby={reg ? "auth-pass-hint" : undefined} disabled={busy} onChange={(e) => setPass(e.target.value)} />
          {reg && <span id="auth-pass-hint" className="auth-hint">{t("login.passHint")}</span>}
          {err.pass && <span className="err-msg">{err.pass}</span>}
        </label>
        {sitekey && <div ref={boxRef} className="auth-captcha" role="group" aria-label={t("login.captcha")} />}
        {formErr && <div className="err-msg auth-err" role="alert">{formErr}</div>}
        <button type="submit" className="btn primary" disabled={busy}>
          {busy ? t("login.busy") : <>{reg ? t("login.submitRegister") : t("login.submit")} <span aria-hidden="true">&rsaquo;</span></>}
        </button>
      </form>
    </section>
  );
}
