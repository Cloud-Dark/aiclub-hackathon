import React, { useCallback, useEffect, useRef, useState } from "react";
import { makeT, detectLang } from "./i18n/index.js";
import { SCREENS, STEP_OF } from "./data.js";
import { total, quizDone, identDone, reachable } from "./lib/scoring.js";
import { Header, Stepper, BottomNav } from "./components/Chrome.jsx";
import Intro from "./components/Intro.jsx";
import Identity from "./components/Identity.jsx";
import Quiz from "./components/Quiz.jsx";
import Result from "./components/Result.jsx";
import Final from "./components/Final.jsx";

const PERSIST = ["screen", "nama", "kota", "email", "wa", "linkedin", "latar", "idx", "jawab", "override", "webhookSent"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initState() {
  const st = { lang: detectLang(), screen: "intro", nama: "", kota: "", email: "", wa: "", linkedin: "", latar: "kerja-tech", idx: 0, jawab: [], override: null, webhookSent: false };
  try {
    const saved = JSON.parse(localStorage.getItem("hk_state") || "null");
    if (saved && typeof saved === "object") PERSIST.forEach((k) => { if (k in saved) st[k] = saved[k]; });
  } catch (e) {}
  if (!SCREENS.includes(st.screen)) st.screen = "intro";
  if (st.screen !== "intro" && !identDone(st)) st.screen = "intro";
  if ((st.screen === "hasil" || st.screen === "final") && !quizDone(st.jawab)) st.screen = "kuis";
  return st;
}

export default function App() {
  const [st, setSt] = useState(initState);
  const [errors, setErrors] = useState({});
  const [toastMsg, setToastMsg] = useState("");
  const toastT = useRef();
  const { t, get, role } = makeT(st.lang);

  useEffect(() => {
    try {
      const o = {};
      PERSIST.forEach((k) => { o[k] = st[k]; });
      localStorage.setItem("hk_state", JSON.stringify(o));
    } catch (e) {}
  }, [st]);

  useEffect(() => {
    document.documentElement.lang = get("meta.lang");
    document.title = get("meta.title");
  }, [st.lang]);

  // fokus ke judul hanya saat pindah layar / pertanyaan, bukan setiap interaksi
  useEffect(() => {
    const h = document.querySelector("#app h1, #app h2");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }, [st.screen, st.idx]);

  const patch = useCallback((p, clearErr) => {
    setSt((s) => ({ ...s, ...p }));
    if (clearErr) setErrors((e) => { if (!e[clearErr]) return e; const n = { ...e }; delete n[clearErr]; return n; });
  }, []);

  function toast(msg) {
    setToastMsg(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToastMsg(""), 2200);
  }
  function go(screen, extra) {
    setErrors({});
    setSt((s) => ({ ...s, ...extra, screen }));
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function next() {
    switch (st.screen) {
      case "intro": go("identitas"); break;
      case "identitas": {
        const er = {};
        if (!st.nama.trim()) er.nama = t("identity.errName");
        if (st.email.trim() && !EMAIL_RE.test(st.email.trim())) er.email = t("identity.errEmail");
        if (Object.keys(er).length) {
          setErrors(er);
          setTimeout(() => { const i = document.querySelector(".field.err input"); if (i) i.focus(); }, 0);
          return;
        }
        go("kuis", st.idx >= total() ? { idx: 0 } : null);
        break;
      }
      case "kuis":
        if (st.jawab[st.idx] == null) { toast(t("quiz.pick")); return; }
        if (st.idx + 1 >= total()) go("hasil");
        else { patch({ idx: st.idx + 1 }); window.scrollTo({ top: 0 }); }
        break;
      case "hasil": go("final"); break;
    }
  }
  function back() {
    switch (st.screen) {
      case "identitas": go("intro"); break;
      case "kuis": if (st.idx > 0) patch({ idx: st.idx - 1 }); else go("identitas"); break;
      case "hasil": go("kuis", { idx: total() - 1 }); break;
      case "final": go("hasil"); break;
    }
  }
  function gotoStep(i) {
    if (i === -1) { go("intro"); return; }
    if (!reachable(st, i)) { toast(t("nav.locked")); return; }
    if (i === 0) go("identitas");
    else if (i === 1) {
      let miss = -1;
      for (let k = 0; k < total(); k++) if (st.jawab[k] == null) { miss = k; break; }
      go("kuis", { idx: miss >= 0 ? miss : 0 });
    }
    else if (i === 2) go("hasil");
    else go("final");
  }
  function setLang(k) {
    try { localStorage.setItem("hk_lang", k); } catch (e) {}
    patch({ lang: k });
  }
  const redo = () => go("kuis", { jawab: [], idx: 0, override: null, webhookSent: false });
  const restart = () => go("intro", { nama: "", kota: "", email: "", wa: "", linkedin: "", latar: "kerja-tech", idx: 0, jawab: [], override: null, webhookSent: false });

  // pintasan keyboard A-E / 1-5 di layar kuis
  useEffect(() => {
    function onKey(e) {
      if (st.screen !== "kuis" || e.target.matches("input,select,textarea") || e.ctrlKey || e.metaKey || e.altKey) return;
      const map = { A: 0, B: 1, C: 2, D: 3, E: 4, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
      const k = e.key.toUpperCase();
      if (k in map) {
        const q = get("questions")[st.idx];
        if (map[k] < q.opsi.length) { const j = [...st.jawab]; j[st.idx] = map[k]; patch({ jawab: j }); }
      } else if (e.key === "Enter" && !e.target.matches("button")) next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const common = { st, patch, t, get, role, onNext: next, onBack: back };
  let view;
  switch (st.screen) {
    case "intro": view = <Intro t={t} onNext={next} />; break;
    case "identitas": view = <Identity {...common} errors={errors} />; break;
    case "kuis": view = <Quiz key={st.idx} {...common} />; break;
    case "hasil": view = <Result {...common} onRedo={redo} />; break;
    default: view = <Final {...common} onRestart={restart} />;
  }

  return (
    <>
      <Header st={st} t={t} setLang={setLang} />
      <div className="wrap">
        <Stepper st={st} get={get} gotoStep={gotoStep} />
        <main id="app" aria-live="polite" data-step={STEP_OF[st.screen]}>{view}</main>
      </div>
      <BottomNav st={st} t={t} get={get} gotoStep={gotoStep} />
      <div className={"toast" + (toastMsg ? " on" : "")} role="status">{toastMsg}</div>
    </>
  );
}
