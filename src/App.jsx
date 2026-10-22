import React, { useCallback, useEffect, useRef, useState } from "react";
import { makeT, detectLang } from "./i18n/index.js";
import { SCREENS, STEP_OF } from "./data.js";
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
import { Footer } from "./components/Brand.jsx";
import { activeApp, canCreate } from "./lib/rules.js";
import Announcements from "./components/Announcements.jsx";
import { readInviteCode, findTeam } from "./lib/share.js";
import { api, onBusy } from "./lib/api.js";
import { setSkew, nowMs } from "./lib/time.js";

/*
 * Semua data berasal dari API (/api). Yang disimpan di localStorage hanya preferensi: bahasa (hk_lang) dan layar terakhir (hk_nav).
 *
 * Bentuk `st` (dipakai semua komponen layar):
 *  UI        : lang, screen, idx, mode, viewTeam (nama tim), tab, prevScreen, annOpen (id), invite (nama tim dari link), inviteCode,
 *              clickedMain, ready, config { turnstile_sitekey }
 *  akun      : user { email, nama, member_id } | null
 *  data diri : nama, kota, email, wa, linkedin, github, latar  (disunting lokal, disimpan saat "lanjut")
 *  kuis      : jawab[] (null = belum), override (peran pilihan) | null
 *  flag      : joinedMain, tencentClicked, projectReady, submitClicked, contactConsent
 *  tim saya  : myTeam { id, nama, desc, kota, butuh[], wa, share_code, at } | null  (saya owner)
 *              memberTeam { id, nama, wa } | null                                  (saya anggota yang disetujui)
 *  lamaran   : apps[] { id, team_id, team (nama), status pending|approved|rejected, reason ("expired"|undefined), at, expires_at, decidedAt }
 *  owner     : applicants[] { id, member_id, nama, kota, peran, status, reason, at, expires_at, decidedAt }, invited[] (member_id), builders[] { member_id, nama, kota, peran }
 *  tim       : teams[] { id, nama, kota, anggota, ceo, butuh[], desc, hari, grupN, wa ("" kecuali tim saya), viaLink }
 *  undangan  : receivedInvites[] { id, team_id, team (nama) }
 *  log       : [{ k, at, team }] terlama dulu
 *  pengumuman: ann[] { id, title, summary, pinned, published_at, views, read }, annDetail { id, title, summary, paragraphs, published_at, views, read } | null
 */
const NAV_KEY = "hk_nav";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// dibaca sekali saat modul dimuat
const URL_INVITE = readInviteCode();
const LOG_KIND = { apply: "apply", withdraw: "withdraw", approved: "approved", rejected: "rejected", expired: "autoReject", leave: "leave", open_team: "openTeam", close_team: "closeTeam", invite: "invite", join_main: "joinMain" };
const DAY = 86400000;

const emptyData = () => ({
  user: null, nama: "", kota: "", email: "", wa: "", linkedin: "", github: "", latar: "kerja-tech",
  jawab: [], override: null, joinedMain: false, tencentClicked: false, projectReady: false, submitClicked: false, contactConsent: false,
  myTeam: null, memberTeam: null, apps: [], applicants: [], invited: [], builders: [], teams: [], receivedInvites: [], log: []
});
const fresh = () => ({ ...emptyData(), idx: 0, mode: null, viewTeam: null, tab: "tim", prevScreen: null, annOpen: null, annDetail: null, clickedMain: false, invite: null, inviteCode: null });

const appOf = (a) => ({
  id: a.id, team_id: a.team_id, team: a.team_nama, status: a.status === "expired" ? "rejected" : a.status, reason: a.status === "expired" ? "expired" : undefined,
  at: a.created_at, expires_at: a.expires_at, decidedAt: a.decided_at
});
const readNav = () => { try { return JSON.parse(localStorage.getItem(NAV_KEY) || "null") || {}; } catch (e) { return {}; } };

// layar yang boleh dibuka sesuai progres (gerbang yang sama dengan sebelumnya, kini berdasar data server)
function gate(st) {
  let s = SCREENS.includes(st.screen) ? st.screen : "intro";
  if (s === "info") return s;
  if (s !== "intro" && !st.user) return "intro";
  if (!["intro", "login", "identitas"].includes(s) && !identDone(st)) s = "identitas";
  if (["hasil", "grup", "pilih", "pasar", "tim", "buat", "dasbor", "tencent", "submit"].includes(s) && !quizDone(st.jawab)) s = "kuis";
  if (["pilih", "pasar", "tim", "buat", "dasbor", "tencent", "submit"].includes(s) && !st.joinedMain) s = "grup";
  if ((s === "pasar" || s === "buat" || s === "tim") && (st.myTeam || st.memberTeam)) s = "dasbor";
  if (s === "tim" && !findTeam(st, st.viewTeam)) s = "pasar";
  if (s === "buat" && !canCreate(st)) s = "pilih";
  return s;
}

export default function App() {
  const [st, setSt] = useState(() => ({ ...fresh(), lang: detectLang(), screen: "intro", ready: false, config: {}, ann: [] }));
  const [errors, setErrors] = useState({});
  const [toastMsg, setToastMsg] = useState("");
  const toastT = useRef();
  const [busy, setBusy] = useState(false);
  const stRef = useRef(st);
  stRef.current = st;
  const { t, get, role } = makeT(st.lang);

  function toast(msg) {
    setToastMsg(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToastMsg(""), 3200);
  }
  const fail = (e) => {
    if (e && e.status === 401) setSt((s) => ({ ...s, ...emptyData(), screen: "intro" }));
    toast((e && e.message) || t("err.generic"));
  };

  // indikator "mohon tunggu": muncul bila ada permintaan non-latar belakang yang berjalan lebih dari 250 ms
  useEffect(() => {
    let timer;
    return onBusy((n) => {
      clearTimeout(timer);
      if (n > 0) timer = setTimeout(() => setBusy(true), 250);
      else setBusy(false);
    });
  }, []);

  // ---------- muat data dari server ----------
  const applyMe = useCallback((me, { identity = true } = {}) => {
    setSkew(me.server_time);
    const p = me.participant, pf = me.profile, tm = me.team;
    const apps = me.applications.filter((a) => a.status !== "withdrawn").map(appOf);
    const myTeam = tm && tm.role === "owner" ? { id: tm.id, nama: tm.nama, desc: tm.deskripsi, kota: tm.kota, butuh: tm.butuh, wa: tm.wa_link || "", share_code: tm.share_code, at: tm.joined_at } : null;
    const memberTeam = tm && tm.role === "member" ? { id: tm.id, nama: tm.nama, wa: tm.wa_link || "" } : null;
    const log = me.activity.filter((a) => LOG_KIND[a.kind]).map((a) => ({ k: LOG_KIND[a.kind], at: a.at, team: a.team || "" })).reverse();
    setSt((s) => ({
      ...s,
      user: { email: pf.email, nama: pf.nama, member_id: pf.member_id, role: pf.role },
      ...(identity ? { nama: pf.nama, email: pf.email, kota: pf.kota, wa: pf.wa, linkedin: pf.linkedin, github: pf.github, latar: p.latar } : null),
      jawab: s.screen === "kuis" && !identity ? s.jawab : p.jawaban, override: p.jalur_override,
      joinedMain: !!p.joined_main_at, tencentClicked: !!p.tencent_clicked_at, projectReady: !!p.project_ready_at, submitClicked: !!p.submit_clicked_at, contactConsent: p.contact_consent,
      myTeam, memberTeam, apps, log, receivedInvites: me.invites.map((i) => ({ id: i.id, team_id: i.team_id, team: i.team_nama }))
    }));
    return { myTeam, memberTeam };
  }, []);

  const loadTeams = useCallback(async (own, o) => {
    const [tl, inbox, bl] = await Promise.all([
      api.get("/hackathon/teams", o),
      own.myTeam ? api.get(`/hackathon/teams/${own.myTeam.id}/applications`, o) : null,
      own.myTeam ? api.get("/hackathon/builders", o) : null
    ]);
    setSkew(tl.server_time);
    setSt((s) => ({
      ...s,
      teams: tl.teams.map((x) => ({
        id: x.id, nama: x.nama, kota: x.kota, anggota: x.member_count, ceo: x.owner, butuh: x.butuh, desc: x.deskripsi,
        hari: Math.max(0, Math.floor((nowMs() - x.created_at) / DAY)), grupN: x.member_count,
        wa: own.myTeam && own.myTeam.id === x.id ? own.myTeam.wa : own.memberTeam && own.memberTeam.id === x.id ? own.memberTeam.wa : "",
        viaLink: s.invite === x.nama
      })),
      applicants: inbox ? inbox.applications.map((a) => ({
        id: a.id, member_id: a.member_id, nama: a.nama, kota: a.kota, peran: a.jalur_aktif,
        status: a.status === "expired" ? "rejected" : a.status === "withdrawn" ? "withdrawn" : a.status, reason: a.status === "expired" ? "expired" : undefined,
        at: a.created_at, expires_at: a.expires_at, decidedAt: a.decided_at
      })).filter((a) => a.status !== "withdrawn") : [],
      invited: inbox ? inbox.invited : [],
      builders: bl ? bl.builders.map((b) => ({ member_id: b.member_id, nama: b.nama, kota: b.kota, peran: b.jalur_aktif })) : []
    }));
  }, []);

  const loadAnn = useCallback(async (lang, o) => {
    const r = await api.get("/hackathon/announcements?lang=" + (lang || stRef.current.lang), o);
    setSt((s) => ({ ...s, ann: r.announcements }));
  }, []);

  // muat ulang semua data akun; identity=false agar isian yang sedang disunting tidak tertimpa
  const refresh = useCallback(async (opts) => {
    const o = { silent: !!(opts && opts.silent) };
    try {
      const me = await api.get("/hackathon/me", o);
      const own = applyMe(me, opts);
      await Promise.all([loadTeams(own, o), loadAnn(undefined, o)]);
    } catch (e) { if (e.status === 401) setSt((s) => ({ ...s, ...emptyData() })); }
  }, [applyMe, loadTeams, loadAnn]);

  // ---------- boot ----------
  useEffect(() => {
    (async () => {
      let config = {}, me = null, invite = null, notice = null;
      try { config = await api.get("/config"); } catch (e) {}
      try { me = await api.get("/hackathon/me"); } catch (e) {}
      if (URL_INVITE === null) notice = "invite.bad";
      else if (URL_INVITE) {
        try { invite = await api.get("/hackathon/share/" + URL_INVITE); } catch (e) { notice = "invite.bad"; }
      }
      const nav = readNav();
      setSt((s) => ({ ...s, config, screen: nav.screen || "intro", idx: Number.isInteger(nav.idx) ? nav.idx : 0 }));
      if (me) {
        const own = applyMe(me);
        if (invite && own.myTeam && own.myTeam.id === invite.id) { notice = "invite.own"; invite = null; }
        if (invite) setSt((s) => ({ ...s, invite: invite.nama, inviteCode: URL_INVITE }));
        await Promise.all([loadTeams(own), loadAnn()]);
      } else {
        if (invite) setSt((s) => ({ ...s, invite: invite.nama, inviteCode: URL_INVITE }));
        try { await loadAnn(); } catch (e) {}
      }
      setSt((s) => {
        const g = gate(s);
        const st2 = { ...s, screen: g, ready: true };
        if (st2.invite && st2.user && identDone(st2) && quizDone(st2.jawab) && st2.joinedMain && findTeam(st2, st2.invite)) { st2.screen = "tim"; st2.viewTeam = st2.invite; st2.invite = null; }
        return st2;
      });
      if (notice) toast(t(notice));
    })();
  }, []);

  // polling ringan: status lamaran, tim, pengumuman
  useEffect(() => {
    const id = setInterval(() => { if (stRef.current.user && !document.hidden && stRef.current.screen !== "identitas") refresh({ identity: false, silent: true }); }, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!st.ready) return;
    try { localStorage.setItem(NAV_KEY, JSON.stringify({ screen: st.screen, idx: st.idx })); } catch (e) {}
  }, [st.screen, st.idx, st.ready]);

  useEffect(() => {
    document.documentElement.lang = get("meta.lang");
    document.title = get("meta.title");
  }, [st.lang]);
  useEffect(() => { if (st.ready) loadAnn(st.lang, { silent: true }).catch(() => {}); }, [st.lang]);

  // fokus ke judul hanya saat pindah layar / pertanyaan
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const h = document.querySelector("#app h1, #app h2");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }, [st.screen, st.idx]);

  // ---------- helper umum ----------
  const SERVER_KEYS = { override: "jalur_override", projectReady: "project_ready", tencentClicked: "tencent_clicked", submitClicked: "submit_clicked", jawab: "jawaban" };
  const patch = useCallback((p, clearErr) => {
    setSt((s) => ({ ...s, ...p }));
    if (clearErr) setErrors((e) => { if (!e[clearErr]) return e; const n = { ...e }; delete n[clearErr]; return n; });
    // kunci yang tersimpan di server dikirim langsung
    const body = {};
    for (const [k, col] of Object.entries(SERVER_KEYS)) if (k in p) {
      if ((k === "tencentClicked" || k === "submitClicked") && p[k] !== true) continue;
      body[col] = p[k];
    }
    if (Object.keys(body).length) api.patch("/hackathon/me", body).then((me) => applyMe(me, { identity: false })).catch(fail);
  }, [applyMe]);
  const update = useCallback((fn) => setSt((s) => ({ ...s, ...fn(s) })), []);

  function go(screen, extra) {
    setErrors({});
    setSt((s) => ({ ...s, ...extra, screen }));
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  // jalankan aksi server lalu muat ulang; kembalikan true bila sukses
  async function run(fn, { keepIdentity = true } = {}) {
    try { await fn(); await refresh({ identity: !keepIdentity }); return true; } catch (e) { fail(e); return false; }
  }

  async function saveIdentity() {
    const s = stRef.current;
    const me = await api.patch("/hackathon/me", { nama: s.nama.trim(), kota: s.kota.trim(), wa: s.wa.trim(), linkedin: s.linkedin.trim(), github: (s.github || "").trim(), latar: s.latar });
    applyMe(me, { identity: false });
  }

  function next() {
    switch (st.screen) {
      case "intro": go(st.user ? "identitas" : "login"); break;
      case "identitas": {
        const er = {};
        if (!st.nama.trim()) er.nama = t("identity.errName");
        if (!st.kota.trim()) er.kota = t("identity.errCity");
        if (!waValid(st.wa)) er.wa = t("identity.errWa");
        if (Object.keys(er).length) {
          setErrors(er);
          setTimeout(() => { const i = document.querySelector(".field.err input"); if (i) i.focus(); }, 0);
          return;
        }
        saveIdentity().then(() => go("kuis", st.idx >= total() ? { idx: 0 } : null)).catch(fail);
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
      case "info": go(st.prevScreen && st.prevScreen !== "info" ? st.prevScreen : "intro", { annOpen: null, annDetail: null }); break;
      case "login": go("intro"); break;
      case "identitas": go("intro"); break;
      case "kuis": if (st.idx > 0) patch({ idx: st.idx - 1 }); else go("identitas"); break;
      case "hasil": go("kuis", { idx: total() - 1 }); break;
      case "grup": go("hasil"); break;
      case "pilih": go("grup"); break;
      case "pasar": go("pilih"); break;
      case "tim": go("pasar"); break;
      case "buat": go("pilih"); break;
      case "dasbor": go(st.myTeam || st.memberTeam ? "pilih" : "pasar"); break;
      case "tencent": go("dasbor"); break;
      case "submit": go("tencent"); break;
    }
  }
  const firstMissing = () => {
    for (let k = 0; k < total(); k++) if (st.jawab[k] == null) return k;
    return 0;
  };
  function goSub(key) {
    if (key === "kuis") go("kuis", { idx: firstMissing() });
    else go(key);
  }
  function gotoStep(i) {
    if (i === -1) { go("intro"); return; }
    if (!reachable(st, i)) { toast(t(i > 0 && identDone(st) && quizDone(st.jawab) ? "group.gate" : "nav.locked")); return; }
    if (i === 0) {
      if (STEP_OF[st.screen] === 0) return;
      if (!identDone(st)) go("identitas");
      else if (!quizDone(st.jawab)) go("kuis", { idx: firstMissing() });
      else if (!st.joinedMain) go("grup");
      else go(st.myTeam || st.memberTeam || st.apps.length ? "dasbor" : "pilih");
    }
    else go(i === 1 ? "tencent" : "submit");
  }

  // ---------- auth ----------
  // payload: { email, password, nama?, turnstile_token }; lempar error agar form menampilkan pesannya
  async function authenticate(kind, payload) {
    await api.post("/auth/" + kind, payload);
    const me = await api.get("/hackathon/me");
    const own = applyMe(me);
    await Promise.all([loadTeams(own), loadAnn()]);
    setSt((s) => {
      const ss = { ...s };
      let screen = "identitas";
      if (identDone(ss) && quizDone(ss.jawab) && ss.joinedMain) screen = ss.myTeam || ss.memberTeam || ss.apps.length ? "dasbor" : "pilih";
      else if (identDone(ss) && quizDone(ss.jawab)) screen = "grup";
      else if (identDone(ss)) screen = "kuis";
      if (ss.invite && identDone(ss) && quizDone(ss.jawab) && ss.joinedMain && findTeam(ss, ss.invite)) return { ...ss, screen: "tim", viewTeam: ss.invite, invite: null };
      return { ...ss, screen };
    });
    window.scrollTo({ top: 0 });
  }
  async function logout() {
    try { await api.post("/auth/logout"); } catch (e) {}
    setSt((s) => ({ ...s, ...fresh(), screen: "intro", ann: s.ann.map((a) => ({ ...a, read: undefined })) }));
    window.scrollTo({ top: 0 });
  }
  function setLang(k) {
    try { localStorage.setItem("hk_lang", k); } catch (e) {}
    patch({ lang: k });
  }

  const teamByNama = (nama) => st.teams.find((x) => x.nama === nama);

  const actions = {
    authenticate, refresh,
    confirmMain() {
      if (!st.clickedMain) { toast(t("group.confirmHint")); return; }
      api.patch("/hackathon/me", { joined_main: true }).then((me) => {
        applyMe(me, { identity: false });
        setSt((s) => ({ ...s, ...(s.invite ? { screen: "tim", viewTeam: s.invite, invite: null } : { screen: "pilih" }) }));
        window.scrollTo({ top: 0 });
      }).catch(fail);
    },
    toChoose() {
      if (!st.joinedMain) { toast(t("group.gate")); return; }
      if (st.invite) go("tim", { viewTeam: st.invite, invite: null });
      else go("pilih");
    },
    openDetail(team) { go("tim", { viewTeam: team, ...(st.invite === team ? { invite: null } : null) }); },
    toTencent() { go("tencent"); },
    toTeamStep() { go(st.myTeam || st.memberTeam || st.apps.length ? "dasbor" : "pilih"); },
    toChoosePage() { go("pilih"); },
    toMarketBack() { go("pasar"); },
    goDash() { go("dasbor"); },
    chooseJoin() { go("pasar", { mode: "join" }); },
    chooseCreate() { go("buat", { mode: "create" }); },
    // melamar atau menarik lamaran (pending) ke tim bernama `nama`
    async toggleApply(nama) {
      if (st.myTeam) { toast(t("market.lockedOwner")); return; }
      const act = activeApp(st);
      if (act && act.team !== nama) { toast(act.status === "approved" ? t("market.lockedMember") : t("market.oneAtATime", { team: act.team })); return; }
      const ex = st.apps.find((x) => x.team === nama);
      if (ex) {
        if (ex.status === "pending") await run(() => api.del("/hackathon/applications/" + ex.id));
        return;
      }
      const tm = teamByNama(nama);
      if (!tm) { toast(t("err.generic")); return; }
      const via = st.invite === nama && st.inviteCode ? "share_link" : st.receivedInvites.some((i) => i.team_id === tm.id) ? "invite" : "market";
      if (await run(() => api.post(`/hackathon/teams/${tm.id}/apply`, { via }))) setSt((s) => ({ ...s, mode: "join" }));
    },
    async leaveTeam() {
      if (!st.memberTeam) return;
      if (await run(() => api.post(`/hackathon/teams/${st.memberTeam.id}/leave`))) go("pilih", { mode: null });
    },
    async withdrawAll() {
      const pend = st.apps.filter((x) => x.status === "pending");
      await run(async () => { for (const a of pend) await api.del("/hackathon/applications/" + a.id); });
      setSt((s) => ({ ...s, mode: null }));
    },
    openTeamGroup(tm) {
      if (tm.wa) window.open(tm.wa, "_blank", "noopener,noreferrer");
      else toast(t("market.groupSoon"));
    },
    async toggleInvite(memberId) {
      const tm = st.myTeam;
      if (!tm) return;
      await run(() => st.invited.includes(memberId) ? api.del(`/hackathon/teams/${tm.id}/invites/${memberId}`) : api.post(`/hackathon/teams/${tm.id}/invites`, { member_id: memberId }));
    },
    // team: { nama, desc, kota, butuh, wa }
    async createTeam(team) {
      if (!canCreate(st)) { toast(t("choose.lockedMember", { team: "" })); return; }
      const ok = await run(() => api.post("/hackathon/teams", { nama: team.nama, deskripsi: team.desc, kota: team.kota, butuh: team.butuh, wa_link: team.wa || null }));
      if (ok) { go("dasbor", { mode: "create" }); }
    },
    async closeTeam() {
      if (!st.myTeam) return;
      if (await run(() => api.post(`/hackathon/teams/${st.myTeam.id}/close`))) go("pilih", { mode: null });
    },
    // kembalikan true bila tersimpan
    saveTeamLink(wa) { return run(() => api.patch(`/hackathon/teams/${st.myTeam.id}`, { wa_link: wa || null })); },
    rotateShareCode() { return run(() => api.post(`/hackathon/teams/${st.myTeam.id}/share-code/rotate`)); },
    decideApplicant(id, status) { return run(() => api.post(`/hackathon/applications/${id}/decide`, { status })); },
    setConsent(v) { return run(() => api.patch("/hackathon/me", { contact_consent: !!v })); },
    // pengumuman: daftar dari layar mana pun; tayangan unik dicatat server saat detail dibuka (peserta login)
    toAnnouncements() { if (st.screen !== "info") go("info", { prevScreen: st.screen, annOpen: null, annDetail: null }); else go("info", { annOpen: null, annDetail: null }); loadAnn().catch(() => {}); },
    async openAnn(id) {
      if (!id) { setSt((s) => ({ ...s, annOpen: null, annDetail: null })); loadAnn().catch(() => {}); return; }
      try {
        const d = await api.get(`/hackathon/announcements/${id}?lang=${stRef.current.lang}`);
        setSt((s) => ({ ...s, annOpen: id, annDetail: d }));
        window.scrollTo({ top: 0 });
        if (stRef.current.user) {
          const v = await api.post(`/hackathon/announcements/${id}/view`);
          setSt((s) => ({
            ...s, annDetail: s.annDetail && s.annDetail.id === id ? { ...s.annDetail, views: v.views, read: true } : s.annDetail,
            ann: s.ann.map((a) => (a.id === id ? { ...a, views: v.views, read: true } : a))
          }));
        }
      } catch (e) { fail(e); }
    },
    async openAnnFrom(id) {
      setSt((s) => ({ ...s, prevScreen: s.screen === "info" ? s.prevScreen : s.screen, screen: "info" }));
      await actions.openAnn(id);
    },
    toast
  };
  const redo = () => go("kuis", { jawab: [], idx: 0, override: null });
  // jawaban kuis dikosongkan di server juga
  const redoAll = () => { patch({ jawab: [], override: null }); redo(); };

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

  if (!st.ready) return <div className="boot" role="status" aria-live="polite" style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--dim)" }}><span className="busy-pill"><i className="busy-spin" aria-hidden="true" />{makeT(st.lang).t("busy.wait")}</span></div>;

  const common = { st, patch, t, get, role, onNext: next, onBack: back };
  let view;
  switch (st.screen) {
    case "info": view = <Announcements {...common} actions={actions} />; break;
    case "intro": view = <Intro t={t} get={get} onNext={next} />; break;
    case "login": view = <Login t={t} st={st} onBack={back} onAuth={authenticate} />; break;
    case "identitas": view = <Identity {...common} errors={errors} />; break;
    case "kuis": view = <Quiz key={st.idx} {...common} />; break;
    case "hasil": view = <Result {...common} onRedo={redoAll} />; break;
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
      <Header st={st} t={t} setLang={setLang} onLogout={logout} onAnn={actions.toAnnouncements} />
      <div className="wrap">
        <Stepper st={st} get={get} gotoStep={gotoStep} />
        <SubSteps st={st} t={t} onGo={goSub} />
        {st.invite && st.screen !== "tim" && <div className="card y invite-bar" role="status">{t("invite.banner", { team: st.invite })}</div>}
        <main id="app" aria-live="polite" data-step={STEP_OF[st.screen]}>{view}</main>
      </div>
      <Footer t={t} />
      <BottomNav st={st} t={t} get={get} gotoStep={gotoStep} onAnn={actions.toAnnouncements} />
      <div className={"toast" + (toastMsg ? " on" : "")} role="status">{toastMsg}</div>
      {busy && <><div className="busy-bar" aria-hidden="true" /><div className="busy-pill fixed" role="status" aria-live="polite"><i className="busy-spin" aria-hidden="true" />{t("busy.wait")}</div></>}
    </>
  );
}
