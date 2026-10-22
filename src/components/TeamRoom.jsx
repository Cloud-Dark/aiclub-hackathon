import React, { useEffect, useRef, useState } from "react";
import { fmtTime } from "../lib/time.js";
import { api } from "../lib/api.js";

// nomor lokal 08xx -> 628xx untuk wa.me
const waHref = (v) => { let d = String(v).replace(/\D/g, ""); if (d.startsWith("0")) d = "62" + d.slice(1); return "https://wa.me/" + d; };
const safeUrl = (v) => (/^https:\/\//.test(v) ? v : null);

function Contacts({ m }) {
  const items = [
    m.wa && { k: "WA", href: waHref(m.wa), label: m.wa },
    m.email && { k: "EMAIL", href: "mailto:" + m.email, label: m.email },
    safeUrl(m.linkedin || "") && { k: "LINKEDIN", href: m.linkedin, label: m.linkedin.replace(/^https:\/\/(www\.)?/, "") },
    safeUrl(m.github || "") && { k: "GITHUB", href: m.github, label: m.github.replace(/^https:\/\/(www\.)?/, "") }
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <ul className="contacts">
      {items.map((c) => (
        <li key={c.k}><span className="kick">{c.k}</span>
          <a href={c.href} target="_blank" rel="noopener noreferrer">{c.label}</a></li>
      ))}
    </ul>
  );
}

const POLL_MS = 5000;
// id pesan = ULID (string yang terurut menurut waktu)
const lastId = (list) => list.reduce((m, x) => (x.id > m ? x.id : m), "");
const merge = (old, add) => {
  const seen = new Map(old.map((x) => [x.id, x]));
  add.forEach((x) => seen.set(x.id, x));
  return [...seen.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
};

// ruang tim: anggota + kontak + chat, semua dari API. Hanya dirender untuk owner dan anggota yang disetujui.
export default function TeamRoom({ st, t, role, team, isOwner, actions }) {
  const id = team.id;
  const myId = st.user && st.user.member_id;
  const [members, setMembers] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadErr, setLoadErr] = useState(false);
  const [reload, setReload] = useState(0);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const box = useRef();
  const alive = useRef(true);
  const lastRef = useRef("");
  const readRef = useRef("");

  const markRead = (list) => {
    const l = lastId(list);
    if (!l || l <= readRef.current) return;
    readRef.current = l;
    api.post(`/hackathon/teams/${id}/messages/read`, { last_read_id: l }).catch(() => {});
  };
  const addMsgs = (add) => {
    if (!alive.current || !add.length) return;
    setMessages((old) => { const n = merge(old, add); lastRef.current = lastId(n); markRead(n); return n; });
  };

  useEffect(() => {
    alive.current = true;
    lastRef.current = ""; readRef.current = "";
    setMembers(null); setMessages([]); setLoadErr(false);
    Promise.all([api.get(`/hackathon/teams/${id}/members`), api.get(`/hackathon/teams/${id}/messages?limit=50`)])
      .then(([m, c]) => {
        if (!alive.current) return;
        setMembers((m && m.members) || []);
        addMsgs((c && c.messages) || []);
      })
      .catch(() => { if (alive.current) setLoadErr(true); });
    const iv = setInterval(() => {
      if (document.hidden) return;
      // chat masih kosong: ambil dari awal; selain itu hanya yang setelah pesan terakhir
      api.get(`/hackathon/teams/${id}/messages?limit=50${lastRef.current ? "&after=" + lastRef.current : ""}`)
        .then((c) => addMsgs((c && c.messages) || []))
        .catch(() => {});
    }, POLL_MS);
    return () => { alive.current = false; clearInterval(iv); };
  }, [id, reload, st.contactConsent]);

  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [messages.length]);

  const errText = (e) => (e && e.status === 429 ? t("room.errFast") : e && e.status === 403 ? t("room.errForbidden") : e && e.status === 400 ? t("room.errInvalid") : e && e.status ? (e.message || t("room.errNet")) : t("room.errNet"));

  async function send(e) {
    e.preventDefault();
    const v = text.trim();
    if (!v) { setErr(t("room.errEmpty")); return; }
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const r = await api.post(`/hackathon/teams/${id}/messages`, { body: v.slice(0, 1000) });
      const msg = r && (r.message || r);
      if (alive.current) { if (msg && msg.id) addMsgs([msg]); setText(""); }
    } catch (x) { if (alive.current) setErr(errText(x)); }
    if (alive.current) setBusy(false);
  }
  async function del(mid) {
    try {
      await api.del(`/hackathon/teams/${id}/messages/${mid}`);
      if (alive.current) setMessages((old) => old.map((x) => (x.id === mid ? { ...x, deleted: true, body: "" } : x)));
    } catch (x) { if (alive.current) setErr(x && x.status === 403 ? t("room.errForbidden") : t("room.errDelete")); }
  }

  const list = members || [];
  return (
    <div className="room">
      <div className="card c" style={{ gap: 12 }}>
        <div className="kick c">{t("room.title")} · {list.length}</div>
        {loadErr && <div className="err-msg">{t("room.errLoad")} <button type="button" className="cbtn" onClick={() => setReload((n) => n + 1)}>{t("room.retry")}</button></div>}
        {!members && !loadErr && <div className="note">{t("room.loading")}</div>}
        <div className="hist">
          {list.map((m) => {
            const me = m.me || m.member_id === myId;
            const c = m.contacts || null;
            return (
              <div key={m.member_id} className="it member" style={{ alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: "1 1 220px" }}>
                  <span className="px" style={{ fontSize: 9 }}>{m.nama}
                    {m.role === "owner" && <span className="tag m via">{t("room.owner")}</span>}
                    {me && <span className="tag via">{t("room.you")}</span>}
                  </span>
                  {m.peran && <span className="tag" style={{ alignSelf: "flex-start" }}>{role(m.peran).ringkas}</span>}
                  {c ? <Contacts m={c} /> : (!me && <span className="note">{t("room.noShared")}</span>)}
                </div>
              </div>
            );
          })}
        </div>
        <label className="check">
          <input type="checkbox" checked={!!st.contactConsent} onChange={(e) => actions.setConsent(e.target.checked)} />
          <span>{t("room.consent")}</span>
        </label>
        <div className="note">{t("room.consentNote")}</div>
      </div>

      <div className="card" style={{ gap: 12 }}>
        <div className="kick c">{t("room.chatTitle")} · {team.nama}</div>
        <div className="chat-log" ref={box} role="log" aria-live="polite">
          {messages.length === 0 && !loadErr && <div className="empty">{t("room.empty")}</div>}
          {messages.map((x) => {
            const me = x.member_id === myId || !!x.me;
            const canDel = !x.deleted && (me || isOwner);
            return (
              <div key={x.id} className={"msg" + (me ? " me" : "")}>
                <span className="who">{me ? t("room.you") : (x.nama || x.who || "")} · {fmtTime(x.created_at || x.at, st.lang)}
                  {canDel && <button type="button" className="msg-del" aria-label={t("room.delLabel")} onClick={() => del(x.id)}>{t("room.del")}</button>}
                </span>
                {x.deleted ? <span className="body msg-gone">{t("room.deleted")}</span> : <span className="body">{x.body}</span>}
              </div>
            );
          })}
        </div>
        <form className="chat-form" onSubmit={send} noValidate>
          <input value={text} maxLength={1000} placeholder={t("room.ph")} aria-label={t("room.label")} aria-invalid={!!err}
            onChange={(e) => { setText(e.target.value); setErr(""); }} />
          <button type="submit" className="cbtn go" disabled={busy}>{t("room.send")}</button>
        </form>
        {err && <span className="err-msg">{err}</span>}
      </div>
    </div>
  );
}
