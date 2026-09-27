PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id           TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name                  TEXT NOT NULL,
  password_hash         TEXT NOT NULL,
  role                  TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','admin')),
  default_category      TEXT NOT NULL DEFAULT 'healthy' CHECK (default_category IN ('healthy','unhealthy')),
  is_active             INTEGER NOT NULL DEFAULT 1,
  must_change_password  INTEGER NOT NULL DEFAULT 1,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,                -- কুকি টোকেনের SHA-256 হ্যাশ
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX sessions_user_idx ON sessions (user_id);

CREATE TABLE settings (
  id                   INTEGER PRIMARY KEY CHECK (id = 1),
  budget_per_person    REAL NOT NULL DEFAULT 30 CHECK (budget_per_person > 0),
  default_cutoff_time  TEXT NOT NULL DEFAULT '16:00'   -- HH:MM, Asia/Dhaka
);
INSERT INTO settings (id) VALUES (1);

CREATE TABLE snack_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  description TEXT,
  price       REAL NOT NULL CHECK (price > 0),
  category    TEXT NOT NULL CHECK (category IN ('healthy','unhealthy')),
  image_url   TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE daily_menus (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_date     TEXT NOT NULL UNIQUE,            -- YYYY-MM-DD
  status        TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft','open','closed','delivered')),
  cutoff_at     TEXT,                            -- ISO 8601 UTC
  note          TEXT,
  created_by    INTEGER REFERENCES users(id),
  opened_at     TEXT,
  closed_at     TEXT,
  delivered_at  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- category আর price মেনু খোলার সময়ের snapshot (যাতে হিস্টোরি ঠিক থাকে)
CREATE TABLE menu_options (
  menu_id        INTEGER NOT NULL REFERENCES daily_menus(id) ON DELETE CASCADE,
  snack_item_id  INTEGER NOT NULL REFERENCES snack_items(id),
  category       TEXT NOT NULL CHECK (category IN ('healthy','unhealthy')),
  price          REAL NOT NULL,
  is_default     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (menu_id, snack_item_id)
);
CREATE UNIQUE INDEX menu_options_one_default_per_category
  ON menu_options (menu_id, category) WHERE is_default = 1;

-- প্রতি মেনুতে প্রতি জনের একটাই সারি
CREATE TABLE selections (
  menu_id        INTEGER NOT NULL REFERENCES daily_menus(id) ON DELETE CASCADE,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snack_item_id  INTEGER NOT NULL,
  is_default     INTEGER NOT NULL DEFAULT 0,
  updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (menu_id, user_id),
  FOREIGN KEY (menu_id, snack_item_id)
    REFERENCES menu_options(menu_id, snack_item_id) ON DELETE CASCADE
);
CREATE INDEX selections_menu_item_idx ON selections (menu_id, snack_item_id);
