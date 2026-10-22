// Router API: /api/* di Cloudflare Pages Functions. Satu pintu masuk, cek session dan peran di sini.
import { E, ApiError, json, errorResponse, isUniqueError } from "./util.js";
import { sessionMember } from "./auth.js";
import { expireDue } from "./db.js";
import * as me from "./routes_me.js";
import * as tm from "./routes_teams.js";
import * as ct from "./routes_content.js";

// [method, path, handler, akses] akses: "public" | "opt" (session opsional) | "member" | "admin"
const ROUTES = [
  ["GET", "/health", (c) => c.json({ ok: true, server_time: c.now }), "public"],
  ["GET", "/config", (c) => c.json({ turnstile_sitekey: c.env.TURNSTILE_SITEKEY || null }), "public"],
  ["POST", "/auth/register", me.register, "public"],
  ["POST", "/auth/login", me.login, "public"],
  ["POST", "/auth/logout", me.logout, "public"],

  ["GET", "/hackathon/me", me.getMe, "member"],
  ["PATCH", "/hackathon/me", me.patchMe, "member"],

  ["GET", "/hackathon/teams", tm.listTeams, "member"],
  ["POST", "/hackathon/teams", tm.createTeam, "member"],
  ["GET", "/hackathon/teams/:id", tm.getTeam, "member"],
  ["PATCH", "/hackathon/teams/:id", tm.patchTeam, "member"],
  ["POST", "/hackathon/teams/:id/close", tm.closeTeam, "member"],
  ["POST", "/hackathon/teams/:id/share-code/rotate", tm.rotateShareCode, "member"],
  ["POST", "/hackathon/teams/:id/apply", tm.applyToTeam, "member"],
  ["POST", "/hackathon/teams/:id/leave", tm.leaveTeam, "member"],
  ["GET", "/hackathon/teams/:id/applications", tm.listApplications, "member"],
  ["POST", "/hackathon/teams/:id/invites", tm.inviteBuilder, "member"],
  ["GET", "/hackathon/teams/:id/members", tm.listMembers, "member"],
  ["DELETE", "/hackathon/teams/:id/invites/:member_id", tm.uninviteBuilder, "member"],
  ["DELETE", "/hackathon/applications/:id", tm.withdrawApplication, "member"],
  ["POST", "/hackathon/applications/:id/decide", tm.decideApplication, "member"],
  ["GET", "/hackathon/builders", tm.listBuilders, "member"],
  ["GET", "/hackathon/share/:code", tm.shareLookup, "public"],

  ["GET", "/hackathon/teams/:id/messages", ct.listMessages, "member"],
  ["POST", "/hackathon/teams/:id/messages", ct.sendMessage, "member"],
  ["POST", "/hackathon/teams/:id/messages/read", ct.markRead, "member"],
  ["DELETE", "/hackathon/teams/:id/messages/:mid", ct.deleteMessage, "member"],

  ["GET", "/hackathon/announcements", ct.listAnnouncements, "opt"],
  ["GET", "/hackathon/announcements/:id", ct.getAnnouncement, "opt"],
  ["POST", "/hackathon/announcements/:id/view", ct.viewAnnouncement, "member"],

  ["GET", "/hackathon/admin/overview", ct.adminOverview, "admin"],
  ["GET", "/hackathon/admin/participants.csv", ct.adminExportParticipants, "admin"],
  ["GET", "/hackathon/admin/announcements", ct.adminListAnnouncements, "admin"],
  ["POST", "/hackathon/admin/announcements", ct.adminCreateAnnouncement, "admin"],
  ["GET", "/hackathon/admin/announcements/:id", ct.adminGetAnnouncement, "admin"],
  ["PATCH", "/hackathon/admin/announcements/:id", ct.adminPatchAnnouncement, "admin"],
  ["DELETE", "/hackathon/admin/announcements/:id", ct.adminDeleteAnnouncement, "admin"],
  ["POST", "/hackathon/admin/announcements/:id/unpublish", ct.adminUnpublish, "admin"],
  ["POST", "/hackathon/admin/announcements/:id/publish", ct.adminPublish, "admin"],
  ["POST", "/hackathon/admin/announcements/:id/archive", ct.adminArchive, "admin"],
  ["GET", "/hackathon/admin/announcements/:id/views", ct.adminAnnouncementViews, "admin"]
].map(([method, path, handler, access]) => ({
  method, handler, access,
  re: new RegExp("^" + path.replace(/:(\w+)/g, "(?<$1>[^/]+)") + "$")
}));

// route yang membaca/mengubah lamaran: kedaluwarsa dicek saat baca (tanpa menunggu cron)
const NEEDS_EXPIRY = /\/(me|teams|applications|builders)(\/|$)/;

export async function handle(request, env, ctx) {
  const url = new URL(request.url), now = Date.now();
  try {
    const path = url.pathname.replace(/^\/api/, "").replace(/\/+$/, "") || "/";
    let allowed = false, found = null;
    for (const r of ROUTES) {
      const m = r.re.exec(path);
      if (!m) continue;
      allowed = true;
      if (r.method === request.method) { found = { r, params: { ...m.groups } }; break; }
    }
    if (!found) {
      if (allowed) return errorResponse(new ApiError(405, "method_not_allowed", "Metode tidak diizinkan"));
      throw E.notFound("Endpoint tidak ada");
    }
    if (!env.DB) throw new ApiError(500, "misconfigured", "Database belum terpasang");

    // proteksi CSRF untuk metode yang mengubah data: Origin (bila ada) harus sama dengan host
    if (request.method !== "GET" && request.method !== "HEAD") {
      const origin = request.headers.get("origin");
      if (origin && new URL(origin).host !== url.host) throw E.forbid("Origin tidak diizinkan");
    }

    const notify = (p) => { const q = Promise.resolve(p).catch((e) => console.error("notify", e && e.message)); if (ctx && ctx.waitUntil) ctx.waitUntil(q); };
    const c = { env, db: env.DB, req: request, url, now, params: found.params, member: null, json, notify };
    const { access } = found.r;
    if (access === "member" || access === "admin" || access === "opt") {
      c.member = await sessionMember(request, env.DB, now);
      if (!c.member && access !== "opt") throw E.unauth();
      if (access === "admin" && c.member.role !== "admin") throw E.forbid("Khusus pengurus");
    }
    if (c.member && NEEDS_EXPIRY.test(path)) await expireDue(env.DB, now, env, notify);
    return await found.r.handler(c);
  } catch (e) {
    if (e instanceof ApiError) return errorResponse(e);
    if (isUniqueError(e)) return errorResponse(E.conflict("Data bentrok dengan aturan yang berlaku"));
    console.error("api error", path_of(url), e && e.stack || e);
    return errorResponse(new ApiError(500, "internal", "Terjadi kesalahan di server"));
  }
}
const path_of = (u) => u.pathname;
