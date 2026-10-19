import React from "react";
import { asset } from "./Brand.jsx";

const ICON = {
  brain: ["..XXXX..", ".XXXXXX.", "XX.XX.XX", "XXXXXXXX", "XX.XX.XX", ".XXXXXX.", "..XXXX..", "...XX..."],
  doc: ["XXXXXX..", "X....XX.", "X.XXXX.X", "X......X", "X.XXXX.X", "X......X", "X.XX...X", "XXXXXXXX"],
  palette: [".XXXXXX.", "XX.XX.XX", "XXXXXXXX", "XX....XX", "XXXXXXXX", ".XXXXXX.", "..XXXX..", "........"]
};
const TONE = ["var(--cyan)", "var(--magenta)", "var(--yellow)"];

function Pixel({ rows, color }) {
  return (
    <svg viewBox="0 0 8 8" width="40" height="40" shapeRendering="crispEdges" aria-hidden="true" style={{ color }}>
      {rows.flatMap((r, y) => [...r].map((c, x) => (c === "X" ? <rect key={x + "-" + y} x={x} y={y} width="1" height="1" fill="currentColor" /> : null)))}
    </svg>
  );
}

export function Poster({ t }) {
  return (
    <figure className="poster">
      <img src={asset("poster.jpg")} alt={t("event.posterAlt")} width="720" height="900" />
    </figure>
  );
}

export function Prize({ t }) {
  const amounts = ["USD 1.800", "USD 800", "USD 500"];
  const usd = t("event.prizeTotal").includes(",") ? (a) => a.replace("1.800", "1,800") : (a) => a;
  const place = ["event.place.0", "event.place.1", "event.place.2"];
  return (
    <div className="card y prize">
      <div className="kick">{t("event.prizeTitle")}</div>
      <div className="big">{t("event.prizeTotal")}</div>
      <div className="prize-rows">
        {[0, 1, 2].map((i) => (
          <div key={i} className="prize-row"><span className="px">{t(place[i])}</span><span className="mono">{usd(amounts[i])}</span></div>
        ))}
      </div>
    </div>
  );
}

export function Dates({ get, t }) {
  const dates = get("event.dates");
  return (
    <div className="card">
      <div className="kick c">{t("event.datesTitle")}</div>
      <div className="tl">
        {dates.map((d, i) => {
          const c = i === 1 ? "var(--yellow)" : i === 0 ? "var(--cyan)" : "var(--faint)";
          return (
            <div key={i} className="it">
              <span className="dot" style={{ background: c }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span className="kick" style={{ color: c }}>{d.d}</span>
                <span className="mono" style={{ fontSize: 19, lineHeight: 1.25 }}>{d.l}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Challenges({ get, t, compact }) {
  const list = get("event.challenges");
  const icons = ["brain", "doc", "palette"];
  return (
    <section>
      <div className="kick c" style={{ marginBottom: 12 }}>{t("event.challengeTitle")}</div>
      <div className={"cards" + (compact ? " compact" : "")}>
        {list.map((c, i) => (
          <article key={c.name} className="card chal" style={{ gap: 10 }}>
            <Pixel rows={ICON[icons[i]]} color={TONE[i]} />
            <div className="px" style={{ fontSize: 11, lineHeight: 1.6 }}>{c.name}</div>
            <div className="kick" style={{ color: TONE[i] }}>{c.tag}</div>
            {!compact && <div className="txt" style={{ fontSize: 19 }}>{c.desc}</div>}
          </article>
        ))}
      </div>
    </section>
  );
}
