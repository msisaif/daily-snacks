-- অ্যাডমিন কারো হয়ে আইটেম বসালে তার id; NULL = নিজে বেছেছে বা বন্ধের সময় অটো ডিফল্ট
ALTER TABLE selections ADD COLUMN assigned_by INTEGER REFERENCES users(id);

-- গেস্টরা ইউজার নয়, তাই আলাদা টেবিল; অ্যাডমিন মেনু ধরে যোগ করেন
CREATE TABLE menu_guests (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_id        INTEGER NOT NULL REFERENCES daily_menus(id) ON DELETE CASCADE,
  guest_no       INTEGER NOT NULL,                -- মেনু অনুযায়ী ১, ২, ৩…
  name           TEXT,                            -- ঐচ্ছিক
  snack_item_id  INTEGER NOT NULL,
  assigned_by    INTEGER NOT NULL REFERENCES users(id),
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (menu_id, guest_no),
  FOREIGN KEY (menu_id, snack_item_id)
    REFERENCES menu_options(menu_id, snack_item_id) ON DELETE CASCADE
);
