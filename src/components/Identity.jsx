import React from "react";
import Combo from "./Combo.jsx";
import { Head, Actions } from "./Common.jsx";
import { LATAR } from "../data.js";

function Field({ label, error, children }) {
  return (
    <label className={"field" + (error ? " err" : "")}>
      <span>{label}</span>
      {children}
      {error && <span className="err-msg">{error}</span>}
    </label>
  );
}

export default function Identity({ st, patch, t, get, errors, onNext, onBack }) {
  const latarOpts = LATAR.map((k) => ({ value: k, label: get("identity.latar")[k] }));
  const opt = " (" + t("identity.optional") + ")";
  return (
    <section className="screen" style={{ maxWidth: 640, margin: "0 auto" }}>
      <Head prompt={t("identity.step")} onBack={onBack} t={t} />
      <h2>{t("identity.title")}</h2>
      <form className="card" noValidate style={{ gap: 16 }} onSubmit={(e) => { e.preventDefault(); onNext(); }}>
        <Field label={t("identity.name") + " *"} error={errors.nama}>
          <input name="nama" autoComplete="name" value={st.nama} placeholder={t("identity.namePh")} aria-invalid={!!errors.nama}
            onChange={(e) => patch({ nama: e.target.value }, "nama")} />
        </Field>
        <div className="row2">
          <Field label={t("identity.city")}>
            <input name="kota" autoComplete="address-level2" value={st.kota} placeholder={t("identity.cityPh")}
              onChange={(e) => patch({ kota: e.target.value })} />
          </Field>
          <Field label={t("identity.email")} error={errors.email}>
            <input name="email" type="email" inputMode="email" autoComplete="email" value={st.email} placeholder={t("identity.emailPh")} aria-invalid={!!errors.email}
              onChange={(e) => patch({ email: e.target.value }, "email")} />
          </Field>
        </div>
        <div className="row2">
          <Field label={t("identity.wa") + opt}>
            <input name="wa" type="tel" inputMode="tel" autoComplete="tel" value={st.wa} placeholder={t("identity.waPh")}
              onChange={(e) => patch({ wa: e.target.value })} />
          </Field>
          <Field label={t("identity.linkedin") + opt}>
            <input name="linkedin" inputMode="url" autoComplete="url" value={st.linkedin} placeholder={t("identity.linkedinPh")}
              onChange={(e) => patch({ linkedin: e.target.value })} />
          </Field>
        </div>
        <div className="field">
          <span>{t("identity.now")}</span>
          <Combo id="latar" label={t("identity.now")} options={latarOpts} value={st.latar} t={t} onChange={(v) => patch({ latar: v })} />
        </div>
        <div className="note">{t("identity.note")}</div>
        <button type="submit" className="sr">submit</button>
      </form>
      <Actions onBack={onBack} t={t}>
        <button type="button" className="btn primary" onClick={onNext}>{t("identity.next")} <span aria-hidden="true">&rsaquo;</span></button>
      </Actions>
    </section>
  );
}
