import React, { useEffect, useRef, useState } from "react";
import { STEP_OF } from "../data.js";
import { subReachable } from "../lib/scoring.js";

// tombol dua-klik untuk aksi yang tidak bisa dibatalkan
export function ConfirmButton({ label, sure, onConfirm, className = "cbtn" }) {
  const [armed, setArmed] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const click = () => {
    if (armed) { clearTimeout(timer.current); setArmed(false); onConfirm(); return; }
    setArmed(true);
    timer.current = setTimeout(() => setArmed(false), 4000);
  };
  return <button type="button" className={className + (armed ? " sent" : "")} onClick={click}>{armed ? sure : label}</button>;
}

// layar -> posisi di indikator langkah 1: Data → Skenario → Jalur → Grup utama → Tim → Status
const FLOW = { identitas: 0, kuis: 1, hasil: 2, grup: 3, pilih: 4, pasar: 4, tim: 4, buat: 4, dasbor: 5 };
const GO = ["identitas", "kuis", "hasil", "grup", "pilih", "dasbor"];

export function SubSteps({ st, t, onGo }) {
  if (!(st.screen in FLOW) || STEP_OF[st.screen] !== 0) return null;
  const cur = FLOW[st.screen];
  const labels = [t("sub.data"), t("sub.quiz"), t("sub.track"), t("sub.group"), st.mode === "create" ? t("sub.teamCreate") : t("sub.team"), t("sub.status")];
  return (
    <ol className="substeps" aria-label="progress">
      {labels.map((l, i) => {
        const cls = i === cur ? "cur" : i < cur ? "done" : "";
        const inner = <><span className="n">{i < cur ? "✓" : i + 1}</span><span className="l">{l}</span></>;
        const can = i < cur && subReachable(st, GO[i]);
        return (
          <li key={i} className={cls} aria-current={i === cur ? "step" : undefined}>
            {can ? <button type="button" className="sub-btn" onClick={() => onGo(GO[i])}>{inner}</button> : inner}
          </li>
        );
      })}
    </ol>
  );
}
