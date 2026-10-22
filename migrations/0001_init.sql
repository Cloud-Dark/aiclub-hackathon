-- Skema backend portal hackathon (D1/SQLite). Waktu = epoch milidetik UTC.
-- Akun dikelola sendiri (tidak terhubung ke aiclub.id), lihat brief.md bagian 5.2.

CREATE TABLE hackathon_member (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,            -- huruf kecil
  nama        TEXT NOT NULL,
  pass_hash   TEXT NOT NULL,
  pass_salt   TEXT NOT NULL,
  kota        TEXT NOT NULL DEFAULT '',
  wa          TEXT NOT NULL DEFAULT '',
  linkedin    TEXT NOT NULL DEFAULT '',
  github      TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'member',  -- member | admin
  created_at  INTEGER NOT NULL
);

CREATE TABLE hackathon_session (
  token_hash  TEXT PRIMARY KEY,                -- SHA-256 dari token cookie
  member_id   TEXT NOT NULL REFERENCES hackathon_member(id),
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);
CREATE INDEX session_by_member ON hackathon_session(member_id);

CREATE TABLE hackathon_login_attempt (
  email       TEXT NOT NULL,
  at          INTEGER NOT NULL
);
CREATE INDEX login_attempt_by_email ON hackathon_login_attempt(email, at);

CREATE TABLE hackathon_participant (
  member_id          TEXT PRIMARY KEY REFERENCES hackathon_member(id),
  latar              TEXT NOT NULL DEFAULT 'kerja-tech',
  jawaban            TEXT NOT NULL DEFAULT '[]',   -- JSON array indeks jawaban
  jalur              TEXT,                         -- hasil skor server
  jalur_override     TEXT,
  contact_consent_at INTEGER,
  joined_main_at     INTEGER,
  tencent_clicked_at INTEGER,
  project_ready_at   INTEGER,
  submit_clicked_at  INTEGER,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);

CREATE TABLE hackathon_team (
  id          TEXT PRIMARY KEY,
  owner_id    TEXT NOT NULL REFERENCES hackathon_participant(member_id),
  nama        TEXT NOT NULL,
  deskripsi   TEXT NOT NULL DEFAULT '',
  kota        TEXT NOT NULL DEFAULT '',
  butuh       TEXT NOT NULL,                       -- JSON array peran
  wa_link     TEXT,
  share_code  TEXT NOT NULL UNIQUE,
  status      TEXT NOT NULL DEFAULT 'open',        -- open | closed
  created_at  INTEGER NOT NULL, closed_at INTEGER
);
CREATE UNIQUE INDEX one_open_team_per_owner ON hackathon_team(owner_id) WHERE status = 'open';
CREATE UNIQUE INDEX one_open_team_name ON hackathon_team(nama COLLATE NOCASE) WHERE status = 'open';

CREATE TABLE hackathon_team_member (
  team_id    TEXT NOT NULL REFERENCES hackathon_team(id),
  member_id  TEXT NOT NULL REFERENCES hackathon_participant(member_id),
  role       TEXT NOT NULL,                        -- owner | member
  joined_at  INTEGER NOT NULL,
  left_at    INTEGER,
  PRIMARY KEY (team_id, member_id, joined_at)
);
CREATE UNIQUE INDEX one_active_membership ON hackathon_team_member(member_id) WHERE left_at IS NULL;
CREATE INDEX team_member_by_team ON hackathon_team_member(team_id) WHERE left_at IS NULL;

CREATE TABLE hackathon_application (
  id          TEXT PRIMARY KEY,
  team_id     TEXT NOT NULL REFERENCES hackathon_team(id),
  member_id   TEXT NOT NULL REFERENCES hackathon_participant(member_id),
  status      TEXT NOT NULL,                       -- pending | approved | rejected | expired | withdrawn
  via         TEXT,                                -- market | share_link | invite
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,
  decided_at  INTEGER,
  decided_by  TEXT
);
CREATE UNIQUE INDEX one_active_app ON hackathon_application(member_id) WHERE status IN ('pending','approved');
CREATE INDEX app_pending_expiry ON hackathon_application(expires_at) WHERE status = 'pending';
CREATE INDEX app_by_team ON hackathon_application(team_id);

CREATE TABLE hackathon_invite (
  id          TEXT PRIMARY KEY,
  team_id     TEXT NOT NULL REFERENCES hackathon_team(id),
  member_id   TEXT NOT NULL REFERENCES hackathon_participant(member_id),
  created_at  INTEGER NOT NULL,
  UNIQUE (team_id, member_id)
);

CREATE TABLE hackathon_activity (
  id          TEXT PRIMARY KEY,
  member_id   TEXT,
  kind        TEXT NOT NULL,
  team_id     TEXT,
  meta        TEXT,
  created_at  INTEGER NOT NULL
);
CREATE INDEX activity_by_member ON hackathon_activity(member_id, created_at);

CREATE TABLE hackathon_announcement (
  id           TEXT PRIMARY KEY,
  pinned       INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'draft',      -- draft | published | archived
  published_at INTEGER,
  created_by   TEXT NOT NULL,
  created_at   INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE TABLE hackathon_announcement_i18n (
  announcement_id TEXT NOT NULL REFERENCES hackathon_announcement(id),
  lang     TEXT NOT NULL,                          -- id | en | zh
  title    TEXT NOT NULL,
  summary  TEXT NOT NULL,
  body     TEXT NOT NULL,
  PRIMARY KEY (announcement_id, lang)
);
CREATE TABLE hackathon_announcement_view (
  announcement_id TEXT NOT NULL REFERENCES hackathon_announcement(id),
  member_id       TEXT NOT NULL,
  first_viewed_at INTEGER NOT NULL,
  last_viewed_at  INTEGER NOT NULL,
  open_count      INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (announcement_id, member_id)
);

CREATE TABLE hackathon_chat_message (
  id          TEXT PRIMARY KEY,                    -- ULID
  team_id     TEXT NOT NULL REFERENCES hackathon_team(id),
  member_id   TEXT NOT NULL,
  body        TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  deleted_at  INTEGER,
  deleted_by  TEXT
);
CREATE INDEX chat_by_team ON hackathon_chat_message(team_id, id);
CREATE INDEX chat_by_member_time ON hackathon_chat_message(member_id, created_at);
CREATE TABLE hackathon_chat_read (
  team_id      TEXT NOT NULL,
  member_id    TEXT NOT NULL,
  last_read_id TEXT,
  PRIMARY KEY (team_id, member_id)
);
