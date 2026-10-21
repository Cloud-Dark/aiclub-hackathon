import React, { useEffect, useRef, useState } from "react";
import { fmtTime } from "../lib/time.js";

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

// ruang tim: anggota + kontak + chat. Hanya dirender untuk owner dan anggota yang disetujui.
export default function TeamRoom({ st, t, role, team, members, messages, onSend }) {
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const box = useRef();
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [messages.length]);

  function send(e) {
    e.preventDefault();
    const v = text.trim();
    if (!v) { setErr(t("room.errEmpty")); return; }
    onSend(v.slice(0, 1000));
    setText(""); setErr("");
  }
  return (
    <div className="room">
      <div className="card c" style={{ gap: 12 }}>
        <div className="kick c">{t("room.title")} · {members.length}</div>
        <div className="hist">
          {members.map((m) => (
            <div key={m.nama + (m.me ? "-me" : "")} className="it member" style={{ alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: "1 1 220px" }}>
                <span className="px" style={{ fontSize: 9 }}>{m.nama}
                  {m.owner && <span className="tag m via">{t("room.owner")}</span>}
                  {m.me && <span className="tag via">{t("room.you")}</span>}
                </span>
                {m.peran && <span className="tag" style={{ alignSelf: "flex-start" }}>{role(m.peran).ringkas}</span>}
                <Contacts m={m} />
                {m.noContact && <span className="note">{t("room.noContact")}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ gap: 12 }}>
        <div className="kick c">{t("room.chatTitle")} · {team.nama}</div>
        <div className="chat-log" ref={box} role="log" aria-live="polite">
          {messages.length === 0 && <div className="empty">{t("room.empty")}</div>}
          {messages.map((x, i) => (
            <div key={x.at + "-" + i} className={"msg" + (x.me ? " me" : "")}>
              <span className="who">{x.me ? t("room.you") : x.who} · {fmtTime(x.at, st.lang)}</span>
              <span className="body">{x.text}</span>
            </div>
          ))}
        </div>
        <form className="chat-form" onSubmit={send} noValidate>
          <input value={text} maxLength={1000} placeholder={t("room.ph")} aria-label={t("room.label")} aria-invalid={!!err}
            onChange={(e) => { setText(e.target.value); setErr(""); }} />
          <button type="submit" className="cbtn go">{t("room.send")}</button>
        </form>
        {err && <span className="err-msg">{err}</span>}
        <div className="note">{t("room.demo")}</div>
      </div>
    </div>
  );
}
