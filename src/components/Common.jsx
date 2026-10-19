import React from "react";

export function Head({ prompt, onBack, t, showBack = true }) {
  return (
    <div className="head">
      <div className="prompt">&gt; {prompt}</div>
      {showBack && (
        <button type="button" className="head-back" onClick={onBack} aria-label={t("nav.back")}>
          <span aria-hidden="true">&lsaquo;</span>{t("nav.back")}
        </button>
      )}
    </div>
  );
}

export function Actions({ onBack, t, children, extra }) {
  return (
    <div className="actions">
      <button type="button" className="btn ghost btn-back" onClick={onBack}>
        <span aria-hidden="true">&lsaquo;</span>{t("nav.back")}
      </button>
      {children}
      {extra}
    </div>
  );
}
