import React from "react";
import { Head, Actions } from "./Common.jsx";
import { total } from "../lib/scoring.js";

const K = ["A", "B", "C", "D", "E"];

export default function Quiz({ st, patch, t, get, onNext, onBack }) {
  const n = total();
  const i = Math.min(st.idx, n - 1);
  const q = get("questions")[i];
  const sel = st.jawab[i];
  const last = i === n - 1;
  const has = sel != null;
  return (
    <section className="screen" style={{ maxWidth: 760, margin: "0 auto" }}>
      <Head prompt={t("quiz.progress", { a: i + 1, b: n })} onBack={onBack} t={t} />
      <div className="qtop"><span className="mono" style={{ fontSize: 18, color: "var(--faint)" }}>{t("quiz.noRight")}</span></div>
      <div className="qbar" aria-hidden="true">
        {Array.from({ length: n }, (_, b) => <i key={b} className={b < i ? "d" : b === i ? "c" : ""} />)}
      </div>
      <h2 className="qtitle">{q.judul}</h2>
      <p className="lead" style={{ fontSize: 16, maxWidth: 640 }}>{q.teks}</p>
      <div className="opts" role="radiogroup" aria-label={q.judul}>
        {q.opsi.map((o, j) => (
          <button key={j} type="button" className="opt" role="radio" aria-checked={sel === j} onClick={() => patch({ jawab: Object.assign([], st.jawab, { [i]: j }) })}>
            <span className="kd">{K[j]}</span><span className="lb">{o}</span>
          </button>
        ))}
      </div>
      <Actions onBack={onBack} t={t}>
        <button type="button" className="btn primary" aria-disabled={!has} onClick={onNext}>
          {last ? t("quiz.finish") : t("quiz.next")} <span aria-hidden="true">&rsaquo;</span>
        </button>
      </Actions>
    </section>
  );
}
