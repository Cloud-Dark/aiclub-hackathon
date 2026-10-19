import React, { useEffect, useRef, useState } from "react";
import { STEP_OF } from "../data.js";

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

const FLOW = { grup: 0, pilih: 1, pasar: 2, tim: 2, buat: 2, dasbor: 3 };

// indikator langkah kecil di dalam langkah TIM: Grup utama → Pilih → Lamar/Buat → Status
export function SubSteps({ screen, t, mode }) {
  if (!(screen in FLOW)) return null;
  const cur = FLOW[screen];
  const labels = [t("sub.group"), t("sub.choose"), mode === "create" ? t("sub.create") : t("sub.join"), t("sub.status")];
  return (
    <ol className="substeps" aria-label="progress">
      {labels.map((l, i) => (
        <li key={i} className={i === cur ? "cur" : i < cur ? "done" : ""} aria-current={i === cur ? "step" : undefined}>
          <span className="n">{i < cur ? "✓" : i + 1}</span><span className="l">{l}</span>
        </li>
      ))}
    </ol>
  );
}
