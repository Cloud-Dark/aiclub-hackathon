import React from "react";

const base = import.meta.env.BASE_URL;
export const asset = (name) => base + "brand/" + name;

// mitra resmi event (data dari aiclub.id/event/tencent-cloud-hackathon-2026)
export const PARTNERS = [
  { key: "tencent", label: "TENCENT CLOUD", src: "tencent.png", url: "https://www.tencentcloud.com/" },
  { key: "sumopod", label: "SumoPod", src: "sumopod.png", url: "https://sumopod.com/", wordmark: true },
  { key: "workbuddy", label: "WORKBUDDY", src: "workbuddy.png", url: "https://www.workbuddy.ai/" },
  { key: "codebuddy", label: "CODEBUDDY", src: "codebuddy.png", url: "https://www.codebuddy.ai/" }
];

export function PartnerChip({ p }) {
  return (
    <a className={"pchip" + (p.wordmark ? " wm" : "")} href={p.url} target="_blank" rel="noopener noreferrer" title={p.label}>
      <img src={asset(p.src)} alt={p.wordmark ? p.label : ""} height="28" loading="lazy" />
      {!p.wordmark && <span className="px">{p.label}</span>}
    </a>
  );
}

export function Partners({ t }) {
  return (
    <div className="partners-strip">
      <div className="kick">{t("event.partnersTitle")}</div>
      <div className="pchips">{PARTNERS.map((p) => <PartnerChip key={p.key} p={p} />)}</div>
    </div>
  );
}

export function Footer({ t }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-brand">
          <img src={asset("aiclub.png")} alt="" width="32" height="32" />
          <div>
            <div className="px" style={{ fontSize: 10 }}>AICLUB<b style={{ color: "var(--yellow)", fontWeight: 400 }}>.ID</b></div>
            <div className="mono" style={{ fontSize: 17, color: "var(--dim)" }}>{t("event.collab")}</div>
          </div>
        </div>
        <Partners t={t} />
      </div>
    </footer>
  );
}
