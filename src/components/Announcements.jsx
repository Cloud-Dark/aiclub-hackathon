import React from "react";
import { Head, Actions } from "./Common.jsx";
import { fmtTime } from "../lib/time.js";

// belum dibaca: read === false (undefined = belum login)
export const unreadCount = (st) => (st.ann || []).filter((p) => p.read === false).length;

function Meta({ st, t, p }) {
  const flag = typeof p.read === "boolean" ? p.read : null;
  return (
    <div className="ann-meta">
      {p.pinned && <span className="tag m">{t("ann.pinned")}</span>}
      <span>{fmtTime(Date.parse(p.published_at), st.lang)}</span><i>|</i>
      <span>{t("ann.views", { n: p.views || 0 })}</span>
      {flag !== null && <span className={"ann-flag" + (flag ? "" : " new")}>{flag ? t("ann.read") : t("ann.new")}</span>}
    </div>
  );
}

// ringkasan untuk dasbor (server sudah mengurutkan: disematkan dulu, lalu terbaru)
export function AnnTeaser({ st, t, onOpen, onAll, n = 3 }) {
  const un = unreadCount(st);
  const list = (st.ann || []).slice(0, n);
  return (
    <div className="card">
      <div className="kick c">{t("ann.latest")}{un > 0 && <span className="ann-count">{t("ann.unread", { n: un })}</span>}</div>
      {list.length === 0 ? <div className="note">{t("ann.empty")}</div> : (
        <div className="hist">
          {list.map((p) => (
            <button key={p.id} type="button" className="it ann-row" onClick={() => onOpen(p.id)}>
              <span className="ann-title">{p.title}</span>
              <Meta st={st} t={t} p={p} />
            </button>
          ))}
        </div>
      )}
      <button type="button" className="cbtn" onClick={onAll}>{t("ann.all")}</button>
    </div>
  );
}

export default function Announcements({ st, t, actions, onBack }) {
  if (st.annOpen) {
    const d = st.annDetail && st.annDetail.id === st.annOpen ? st.annDetail : null;
    return (
      <section className="screen" style={{ maxWidth: 760, margin: "0 auto" }}>
        <Head prompt={t("ann.prompt") + "/" + st.annOpen} onBack={() => actions.openAnn(null)} t={t} />
        {d ? (
          <>
            <h2>{d.title}</h2>
            <article className="card c ann-body">
              <Meta st={st} t={t} p={d} />
              {(d.paragraphs || []).map((par, i) => <p key={i} className="txt">{par}</p>)}
            </article>
            <div className="note" style={{ marginTop: 12 }}>{t("ann.viewsNote")}</div>
          </>
        ) : <p className="lead" role="status">{t("ann.loading")}</p>}
        <Actions onBack={() => actions.openAnn(null)} t={t}>
          <button type="button" className="btn ghost" onClick={() => actions.openAnn(null)}>{t("ann.back")}</button>
        </Actions>
      </section>
    );
  }
  const list = st.ann || [];
  return (
    <section className="screen" style={{ maxWidth: 760, margin: "0 auto" }}>
      <Head prompt={t("ann.prompt")} onBack={onBack} t={t} />
      <h2>{t("ann.title")}</h2>
      <p className="lead" style={{ marginBottom: 14 }}>{t("ann.lead")}</p>
      {list.length === 0 ? <div className="card"><div className="txt">{t("ann.empty")}</div></div> : (
        <div className="hist">
          {list.map((p) => (
            <button key={p.id} type="button" className={"it ann-row" + (p.pinned ? " pin" : "")} onClick={() => actions.openAnn(p.id)}>
              <span className="ann-title">{p.title}</span>
              {p.summary && <span className="ann-sum">{p.summary}</span>}
              <Meta st={st} t={t} p={p} />
            </button>
          ))}
        </div>
      )}
      <div className="note" style={{ marginTop: 12 }}>{t("ann.viewsNote")}</div>
      <Actions onBack={onBack} t={t} />
    </section>
  );
}
