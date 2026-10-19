import React, { useEffect, useMemo, useRef, useState } from "react";

const SEARCH_ICON = "M2 0h4v1h1v1h1v4H7v1H6v1H2V7H1V6H0V2h1V1h1zm0 2v4h4V2zM7 7h1v1h1v1h1v1H9V9H8V8H7z";
const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function Highlight({ label, q }) {
  if (!q) return label;
  const i = norm(label).indexOf(norm(q));
  if (i < 0) return label;
  return <>{label.slice(0, i)}<mark>{label.slice(i, i + q.length)}</mark>{label.slice(i + q.length)}</>;
}

export default function Combo({ id, label, options, value, onChange, t }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [act, setAct] = useState(0);
  const [up, setUp] = useState(false);
  const root = useRef(null);
  const btn = useRef(null);
  const input = useRef(null);
  const list = useRef(null);

  const cur = options.find((o) => o.value === value) || options[0];
  const filtered = useMemo(() => {
    const n = norm(q.trim());
    return options.filter((o) => !n || norm(o.label).includes(n) || norm(o.value).includes(n));
  }, [options, q]);

  function openList(seed) {
    const r = btn.current.getBoundingClientRect();
    const limit = window.innerHeight - (matchMedia("(max-width:767px)").matches ? 76 : 0);
    setUp(limit - r.bottom < 300 && r.top > limit - r.bottom);
    setQ(seed || "");
    setAct(seed ? 0 : Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }
  function close(focusBtn) {
    setOpen(false);
    if (focusBtn) btn.current && btn.current.focus({ preventScroll: true });
  }
  function choose(v) {
    onChange(v);
    close(true);
  }

  useEffect(() => { if (open && input.current) input.current.focus({ preventScroll: true }); }, [open]);
  useEffect(() => {
    if (!open || !list.current) return;
    const a = list.current.querySelector(".act");
    if (a) a.scrollIntoView({ block: "nearest" });
  }, [open, act, filtered]);
  useEffect(() => {
    if (!open) return;
    const away = (e) => { if (root.current && !root.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("touchstart", away); };
  }, [open]);

  function onInputKey(e) {
    const n = filtered.length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (n) setAct((act + (e.key === "ArrowDown" ? 1 : -1) + n) % n); }
    else if (e.key === "Home" || e.key === "End") { e.preventDefault(); setAct(e.key === "Home" ? 0 : Math.max(0, n - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); if (filtered[act]) choose(filtered[act].value); }
    else if (e.key === "Escape") { e.preventDefault(); close(true); }
    else if (e.key === "Tab") setOpen(false);
  }
  function onBtnKey(e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); openList(); }
    else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); openList(e.key); }
  }

  return (
    <div ref={root} className={"combo" + (open ? " open" : "") + (up ? " up" : "")}>
      <button
        ref={btn} type="button" className="combo-btn" id={"cb-" + id}
        aria-haspopup="listbox" aria-expanded={open} aria-label={label + ": " + cur.label}
        onClick={() => (open ? close(true) : openList())} onKeyDown={onBtnKey}
      >
        <span className="cv">{cur.label}</span><span className="caret" aria-hidden="true">&#9660;</span>
      </button>
      {open && (
        <div className="combo-pop">
          <div className="combo-search">
            <svg viewBox="0 0 10 10" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true"><path d={SEARCH_ICON} /></svg>
            <input
              ref={input} className="combo-q" type="text" role="combobox" aria-expanded="true"
              aria-controls={"lb-" + id} aria-autocomplete="list" autoComplete="off" autoCorrect="off" spellCheck="false"
              enterKeyHint="done" aria-label={t("combo.search") + " " + label} placeholder={t("combo.search")}
              aria-activedescendant={filtered.length ? `lb-${id}-${act}` : undefined}
              value={q} onChange={(e) => { setQ(e.target.value); setAct(0); }} onKeyDown={onInputKey}
            />
            <span className="combo-count">{t("combo.count", { n: filtered.length })}</span>
          </div>
          <ul ref={list} className="combo-list" id={"lb-" + id} role="listbox" aria-label={label}>
            {filtered.length === 0 && <li className="none" role="option" aria-disabled="true">{t("combo.empty", { q: q.trim() })}</li>}
            {filtered.map((o, i) => (
              <li
                key={o.value} role="option" id={`lb-${id}-${i}`} aria-selected={o.value === value}
                className={i === act ? "act" : ""}
                onMouseDown={(e) => e.preventDefault()} onClick={() => choose(o.value)}
              >
                <span><Highlight label={o.label} q={q.trim()} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
