// Email transaksional lewat Resend. Tanpa RESEND_API_KEY, pengiriman dilewati (tidak error).
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function sendEmail(env, { to, subject, text }) {
  if (!env.RESEND_API_KEY || !to) return false;
  const site = env.SITE_URL || "";
  const html = `<div style="font:15px/1.6 system-ui,sans-serif;color:#111">${esc(text).replace(/\n/g, "<br>")}${site ? `<p><a href="${esc(site)}">${esc(site.replace(/^https?:\/\//, ""))}</a></p>` : ""}<p style="color:#666;font-size:12px">AI Agent Hackathon · AIClub.id</p></div>`;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM || "AI Agent Hackathon <onboarding@resend.dev>", to: [to], subject, text: text + (site ? "\n\n" + site : ""), html })
    });
    if (!r.ok) console.error("resend gagal", r.status, (await r.text()).slice(0, 200));
    return r.ok;
  } catch (e) { console.error("resend error", e && e.message); return false; }
}

export const mail = {
  newApplication: (owner, applicant, team) => ({
    to: owner.email, subject: `Lamaran baru untuk tim ${team}`,
    text: `Halo ${owner.nama},\n\n${applicant} melamar ke tim ${team}. Buka portal untuk menyetujui atau menolak. Batas keputusan 24 jam; setelah itu lamaran ditolak otomatis.`
  }),
  decided: (applicant, team, approved) => ({
    to: applicant.email, subject: approved ? `Lamaranmu ke tim ${team} disetujui` : `Lamaranmu ke tim ${team} ditolak`,
    text: approved
      ? `Halo ${applicant.nama},\n\nSelamat, lamaranmu ke tim ${team} disetujui. Buka portal untuk melihat link grup tim, anggota, dan chat.`
      : `Halo ${applicant.nama},\n\nLamaranmu ke tim ${team} ditolak. Kamu bisa melamar ke tim lain di pasar tim.`
  }),
  expired: (applicant, team) => ({
    to: applicant.email, subject: `Lamaranmu ke tim ${team} kedaluwarsa`,
    text: `Halo ${applicant.nama},\n\nOwner tim ${team} tidak memutuskan dalam 24 jam, jadi lamaranmu ditolak otomatis. Kamu bisa melamar ke tim lain.`
  })
};
