-- OAuth 2.1 (PKCE) untuk MCP: login admin lewat akun portal.
CREATE TABLE hackathon_oauth_client (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  redirect_uris TEXT NOT NULL,                 -- JSON array
  created_at    INTEGER NOT NULL
);
CREATE TABLE hackathon_oauth_code (
  code_hash      TEXT PRIMARY KEY,
  client_id      TEXT NOT NULL,
  member_id      TEXT NOT NULL,
  redirect_uri   TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  expires_at     INTEGER NOT NULL
);
CREATE TABLE hackathon_oauth_token (
  token_hash  TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,                   -- access | refresh
  client_id   TEXT NOT NULL,
  member_id   TEXT NOT NULL,
  expires_at  INTEGER NOT NULL
);
CREATE INDEX oauth_token_by_member ON hackathon_oauth_token(member_id);
