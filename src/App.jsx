import React, { useCallback, useEffect, useRef, useState } from "react";
import { makeT, detectLang } from "./i18n/index.js";
import { SCREENS, STEP_OF, SEED_APPLICANTS, BUILDER } from "./data.js";
import { total, quizDone, identDone, reachable, waValid } from "./lib/scoring.js";
import { Header, Stepper, BottomNav } from "./components/Chrome.jsx";
import Intro from "./components/Intro.jsx";
import Login from "./components/Login.jsx";
import Identity from "./components/Identity.jsx";
import Quiz from "./components/Quiz.jsx";
import Result from "./components/Result.jsx";
import Group from "./components/Group.jsx";
import Choose from "./components/Choose.jsx";
import Create from "./components/Create.jsx";
import TeamDetail from "./components/TeamDetail.jsx";
import Market from "./components/Market.jsx";
import Dash from "./components/Dash.jsx";
import Tencent from "./components/Tencent.jsx";
import Submit from "./components/Submit.jsx";
import { SubSteps } from "./components/Widgets.jsx";
import { activeApp, canCreate } from "./lib/rules.js";
import { TIM } from "./data.js";

const PERSIST = ["user", "screen", "nama", "kota", "email", "wa", "linkedin", "latar", "idx", "jawab", "override",
  "clickedMain", "joinedMain", "mode", "viewTeam", "tencentClicked", "projectReady", "submitClicked", "tab", "apps", "undang", "myTeam", "applicants", "log"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fresh = () => ({
  user: null,
  nama: "", kota: "", email: "", wa: "", linkedin: "", latar: "kerja-tech", idx: 0, jawab: [], override: null,
  clickedMain: false, joinedMain: false, mode: null, viewTeam: null, tencentClicked: false, projectReady: false, submitClicked: false, tab: "tim", apps: [], undang: [], myTeam: null, applicants: [], log: []
});

function initState() {
  const st = { ...fresh(), lang: detectLang(), screen: "intro" };
  try {
    const saved = JSON.parse(localStorage.getItem("hk_state") || "null");
    if (saved && typeof saved === "object") PERSIST.forEach((k) => { if (k in saved) st[k] = saved[k]; });
  } catch (e) {}
  if (!SCREENS.includes(st.screen)) st.screen = "intro";
  if (st.screen !== "intro" && !st.user) st.screen = "intro";
  else if (!["intro", "login", "identitas"].includes(st.screen) && !identDone(st)) st.screen = "identitas";
  if (["hasil", "grup", "pilih", "pasar", "tim", "buat", "dasbor", "tencent", "submit"].includes(st.screen) && !quizDone(st.jawab)) st.screen = "kuis";
  if (["pilih", "pasar", "tim", "buat", "dasbor", "tencent", "submit"].includes(st.screen) && !st.joinedMain) st.screen = "grup";
  if ((st.screen === "pasar" || st.screen === "buat" || st.screen === "tim") && st.myTeam) st.screen = "dasbor";
  if (st.screen === "tim" && !TIM.some((x) => x.nama === st.viewTeam)) st.screen = "pasar";
  if (st.screen === "buat" && !canCreate(st)) st.screen = "pilih";
  return st;
}

const withLog = (s, k, x) => ({ log: [...s.log, { k, at: Date.now(), ...x }].slice(-60) });

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
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const h = document.querySelector("#app h1, #app h2");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }, [st.screen, st.idx]);

  const patch = useCallback((p, clearErr) => {
    setSt((s) => ({ ...s, ...p }));
    if (clearErr) setErrors((e) => { if (!e[clearErr]) return e; const n = { ...e }; delete n[clearErr]; return n; });
  }, []);
  const update = useCallback((fn) => setSt((s) => ({ ...s, ...fn(s) })), []);

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
      case "intro": go(st.user ? "identitas" : "login"); break;
      case "identitas": {
        const er = {};
        if (!st.nama.trim()) er.nama = t("identity.errName");
        if (!st.kota.trim()) er.kota = t("identity.errCity");
        if (!waValid(st.wa)) er.wa = t("identity.errWa");
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
      case "hasil": go("grup"); break;
      case "pasar": go("dasbor"); break;
      case "tencent": go("submit"); break;
    }
  }
  function back() {
    switch (st.screen) {
      case "login": go("intro"); break;
      case "identitas": go("intro"); break;
      case "kuis": if (st.idx > 0) patch({ idx: st.idx - 1 }); else go("identitas"); break;
      case "hasil": go("kuis", { idx: total() - 1 }); break;
      case "grup": go("hasil"); break;
      case "pilih": go("grup"); break;
      case "pasar": go("pilih"); break;
      case "tim": go("pasar"); break;
      case "buat": go("pilih"); break;
      case "dasbor": go(st.myTeam ? "pilih" : "pasar"); break;
      case "tencent": go("dasbor"); break;
      case "submit": go("tencent"); break;
    }
  }
  const firstMissing = () => {
    for (let k = 0; k < total(); k++) if (st.jawab[k] == null) return k;
    return 0;
  };
  // klik indikator kecil di langkah 1
  function goSub(key) {
    if (key === "kuis") go("kuis", { idx: firstMissing() });
    else go(key);
  }
  // klik langkah besar: 0 daftar di portal kita, 1 daftar tim ke Tencent, 2 submit project
  function gotoStep(i) {
    if (i === -1) { go("intro"); return; }
    if (!reachable(st, i)) { toast(t(i > 0 && identDone(st) && quizDone(st.jawab) ? "group.gate" : "nav.locked")); return; }
    if (i === 0) {
      if (STEP_OF[st.screen] === 0) return;
      if (!identDone(st)) go("identitas");
      else if (!quizDone(st.jawab)) go("kuis", { idx: firstMissing() });
      else if (!st.joinedMain) go("grup");
      else go(st.myTeam || st.apps.length ? "dasbor" : "pilih");
    }
    else go(i === 1 ? "tencent" : "submit");
  }
  function login(u) {
    setSt((s) => ({
      ...s, user: { email: u.email, nama: u.nama },
      nama: s.nama || u.nama, email: u.email, kota: s.kota || u.kota || "", wa: s.wa || u.wa || "", linkedin: s.linkedin || u.linkedin || "",
      screen: "identitas"
    }));
    window.scrollTo({ top: 0 });
  }
  function logout() { go("intro", fresh()); }
  function setLang(k) {
    try { localStorage.setItem("hk_lang", k); } catch (e) {}
    patch({ lang: k });
  }

  const actions = {
    confirmMain() {
      if (!st.clickedMain) { toast(t("group.confirmHint")); return; }
      setSt((s) => ({ ...s, joinedMain: true, ...withLog(s, "joinMain"), screen: "pilih" }));
      window.scrollTo({ top: 0 });
    },
    toChoose() {
      if (!st.joinedMain) { toast(t("group.gate")); return; }
      go("pilih");
    },
    openDetail(team) { go("tim", { viewTeam: team }); },
    toTencent() { go("tencent"); },
    toTeamStep() { go(st.myTeam || st.apps.length ? "dasbor" : "pilih"); },
    toChoosePage() { go("pilih"); },
    toMarketBack() { go("pasar"); },
    goDash() { go("dasbor"); },
    chooseJoin() { go("pasar", { mode: "join" }); },
    chooseCreate() { go("buat", { mode: "create" }); },
    toggleApply(team) {
      if (st.myTeam) { toast(t("market.lockedOwner")); return; }
      const act = activeApp(st);
      if (act && act.team !== team) { toast(act.status === "approved" ? t("market.lockedMember") : t("market.oneAtATime", { team: act.team })); return; }
      update((s) => {
        const ex = s.apps.find((x) => x.team === team);
        if (ex) return ex.status === "pending" ? { apps: s.apps.filter((x) => x.team !== team), ...withLog(s, "withdraw", { team }) } : {};
        return { apps: [...s.apps, { team, status: "pending", at: Date.now() }], mode: "join", ...withLog(s, "apply", { team }) };
      });
    },
    // simulasi keputusan owner tim (mode demo, sampai ada backend)
    decideApp(team, status) {
      update((s) => {
        let log = withLog(s, status, { team });
        let apps = s.apps.map((x) => (x.team === team ? { ...x, status } : x));
        if (status === "approved") {
          // satu orang hanya bisa di satu tim: lamaran lain yang masih menunggu dibatalkan
          const others = apps.filter((x) => x.team !== team && x.status === "pending");
          apps = apps.filter((x) => x.team === team || x.status !== "pending");
          let l = log.log;
          others.forEach((o) => { l = [...l, { k: "autoWithdraw", at: Date.now(), team: o.team }]; });
          log = { log: l.slice(-60) };
        }
        return { apps, ...log };
      });
    },
    leaveTeam(team) {
      update((s) => ({ apps: s.apps.filter((x) => x.team !== team), mode: null, ...withLog(s, "leave", { team }) }));
      go("pilih");
    },
    withdrawAll() {
      update((s) => ({ apps: s.apps.filter((x) => x.status !== "pending"), mode: null, ...withLog(s, "withdrawAll") }));
    },
    openTeamGroup(tm) {
      if (tm.wa) window.open(tm.wa, "_blank", "noopener,noreferrer");
      else toast(t("market.groupSoon"));
    },
    toggleInvite(who) {
      update((s) => {
        const has = s.undang.includes(who);
        return { undang: has ? s.undang.filter((x) => x !== who) : [...s.undang, who], ...withLog(s, has ? "uninvite" : "invite", { who }) };
      });
    },
    createTeam(team) {
      if (!canCreate(st)) { toast(t("choose.lockedMember", { team: "" })); return; }
      setSt((s) => ({
        ...s, mode: "create", myTeam: team, undang: [],
        applicants: SEED_APPLICANTS.map((b) => ({ b, status: "pending" })), ...withLog(s, "openTeam", { team: team.nama }), screen: "dasbor"
      }));
      window.scrollTo({ top: 0 });
    },
    closeTeam() {
      const team = st.myTeam ? st.myTeam.nama : "";
      update((s) => ({ myTeam: null, applicants: [], undang: [], mode: null, ...withLog(s, "closeTeam", { team }) }));
      go("pilih");
    },
    saveTeamLink(wa) { update((s) => ({ myTeam: { ...s.myTeam, wa } })); },
    decideApplicant(i, status) {
      update((s) => ({
        applicants: s.applicants.map((x, j) => (j === i ? { ...x, status } : x)),
        ...withLog(s, status === "approved" ? "approveWho" : "rejectWho", { who: BUILDER[s.applicants[i].b].nama })
      }));
    },
    restart() { go("intro", fresh()); }
  };
  const redo = () => go("kuis", { jawab: [], idx: 0, override: null });

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
    case "login": view = <Login t={t} onBack={back} onLogin={login} />; break;
    case "identitas": view = <Identity {...common} errors={errors} />; break;
    case "kuis": view = <Quiz key={st.idx} {...common} />; break;
    case "hasil": view = <Result {...common} onRedo={redo} />; break;
    case "grup": view = <Group {...common} actions={actions} />; break;
    case "pilih": view = <Choose {...common} actions={actions} />; break;
    case "pasar": view = <Market {...common} actions={actions} />; break;
    case "tim": view = <TeamDetail {...common} actions={actions} />; break;
    case "tencent": view = <Tencent {...common} actions={actions} />; break;
    case "submit": view = <Submit {...common} actions={actions} />; break;
    case "buat": view = <Create {...common} actions={actions} />; break;
    default: view = <Dash {...common} actions={actions} />;
  }

  return (
    <>
      <Header st={st} t={t} setLang={setLang} onLogout={logout} />
      <div className="wrap">
        <Stepper st={st} get={get} gotoStep={gotoStep} />
        <SubSteps st={st} t={t} onGo={goSub} />
        <main id="app" aria-live="polite" data-step={STEP_OF[st.screen]}>{view}</main>
      </div>
      <BottomNav st={st} t={t} get={get} gotoStep={gotoStep} />
      <div className={"toast" + (toastMsg ? " on" : "")} role="status">{toastMsg}</div>
    </>
  );
}
