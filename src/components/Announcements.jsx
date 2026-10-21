import React from "react";
import { Head, Actions } from "./Common.jsx";
import { PENGUMUMAN } from "../data.js";
import { fmtTime } from "../lib/time.js";

// tayangan: angka contoh + 1 bila akun ini sudah membuka (dihitung sekali per akun)
export const annViews = (st, p) => p.views + (st.annViewed.includes(p.id) ? 1 : 0);
export const unreadCount = (st) => PENGUMUMAN.filter((p) => !st.annViewed.includes(p.id)).length;
const textOf = (get, p) => get("announcements")[PENGUMUMAN.indexOf(p)] || {};
// disematkan dulu, lalu terbaru
const sorted = () => PENGUMUMAN.slice().sort((a, b) => (b.pin - a.pin) || (Date.parse(b.at) - Date.parse(a.at)));

function Meta({ st, t, p }) {
  const read = st.annViewed.includes(p.id);
  return (
    <div className="ann-meta">
      {p.pin && <span className="tag m">{t("ann.pinned")}</span>}
      <span>{fmtTime(Date.parse(p.at), st.lang)}</span><i>|</i>
      <span>{t("ann.views", { n: annViews(st, p) })}</span>
      <span className={"ann-flag" + (read ? "" : " new")}>{read ? t("ann.read") : t("ann.new")}</span>
    </div>
  );
}

// ringkasan untuk dasbor
export function AnnTeaser({ st, t, get, onOpen, onAll, n = 3 }) {
  const un = unreadCount(st);
  return (
    <div className="card">
      <div className="kick c">{t("ann.latest")}{un > 0 && <span className="ann-count">{t("ann.unread", { n: un })}</span>}</div>
      <div className="hist">
        {sorted().slice(0, n).map((p) => (
          <button key={p.id} type="button" className="it ann-row" onClick={() => onOpen(p.id)}>
            <span className="ann-title">{textOf(get, p).judul}</span>
            <Meta st={st} t={t} p={p} />
          </button>
        ))}
      </div>
      <button type="button" className="cbtn" onClick={onAll}>{t("ann.all")}</button>
    </div>
  );
}

export default function Announcements({ st, t, get, actions, onBack }) {
  const open = st.annOpen ? PENGUMUMAN.find((p) => p.id === st.annOpen) : null;
  if (open) {
    const x = textOf(get, open);
    return (
      <section className="screen" style={{ maxWidth: 760, margin: "0 auto" }}>
        <Head prompt={t("ann.prompt") + "/" + open.id} onBack={() => actions.openAnn(null)} t={t} />
        <h2>{x.judul}</h2>
        <article className="card c ann-body">
          <Meta st={st} t={t} p={open} />
          {(x.isi || []).map((par, i) => <p key={i} className="txt">{par}</p>)}
        </article>
        <div className="note" style={{ marginTop: 12 }}>{t("ann.demo")}</div>
        <Actions onBack={() => actions.openAnn(null)} t={t}>
          <button type="button" className="btn ghost" onClick={() => actions.openAnn(null)}>{t("ann.back")}</button>
        </Actions>
      </section>
    );
  }
  return (
    <section className="screen" style={{ maxWidth: 760, margin: "0 auto" }}>
      <Head prompt={t("ann.prompt")} onBack={onBack} t={t} />
      <h2>{t("ann.title")}</h2>
      <p className="lead" style={{ marginBottom: 14 }}>{t("ann.lead")}</p>
      <div className="hist">
        {sorted().map((p) => {
          const x = textOf(get, p);
          return (
            <button key={p.id} type="button" className={"it ann-row" + (p.pin ? " pin" : "")} onClick={() => actions.openAnn(p.id)}>
              <span className="ann-title">{x.judul}</span>
              <span className="ann-sum">{x.ringkas}</span>
              <Meta st={st} t={t} p={p} />
            </button>
          );
        })}
      </div>
      <div className="note" style={{ marginTop: 12 }}>{t("ann.demo")}</div>
      <Actions onBack={onBack} t={t} />
    </section>
  );
}
