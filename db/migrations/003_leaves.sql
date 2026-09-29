-- ছুটি তারিখ ধরে রাখা হয় (মেনু ধরে নয়), যাতে মেনু বানানোর আগেও দেওয়া যায়
-- source: self = নিজে, admin = অ্যাডমিন, api = ভবিষ্যতে অটো (তখন created_by NULL)
CREATE TABLE leaves (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_date  TEXT NOT NULL,                        -- YYYY-MM-DD
  source      TEXT NOT NULL CHECK (source IN ('self','admin','api')),
  created_by  INTEGER REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, leave_date)
);
CREATE INDEX leaves_date_idx ON leaves (leave_date);
