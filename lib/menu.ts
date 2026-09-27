// মেনুর সব নিয়ম এখানে। টেস্ট থেকেও import করা যায়, তাই relative ".ts" import।
import type { InStatement, Row } from "@libsql/client";
import { CATEGORIES, CATEGORY_LABELS, type Category, type MenuStatus } from "./constants.ts";
import { getDb } from "./db.ts";
import { formatTaka } from "./format.ts";
import { getSettings } from "./settings.ts";
import { dhakaToIso, todayInDhaka } from "./time.ts";

export type Menu = {
  id: number;
  menuDate: string;
  status: MenuStatus;
  cutoffAt: string | null;
  note: string | null;
  openedAt: string | null;
  closedAt: string | null;
  deliveredAt: string | null;
};

export type MenuOption = {
  snackItemId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: Category;
  price: number;
  isDefault: boolean;
};

export type SnackForMenu = {
  id: number;
  name: string;
  category: Category;
  price: number;
  isActive: boolean;
};

export type OptionInput = {
  snackItemId: number;
  category: Category;
  price: number;
  isDefault: boolean;
};

// ---------- pure নিয়ম (ডাটাবেস লাগে না) ----------

export function isPastCutoff(cutoffAt: string, now: Date): boolean {
  return now.getTime() >= new Date(cutoffAt).getTime();
}

// ২–৩টা আইটেম, দুই গ্রুপই আছে, দাম ≤ বাজেট, প্রতি গ্রুপে ঠিক একটা ডিফল্ট
export function validateMenuItems(
  items: SnackForMenu[],
  defaultIds: number[],
  budget: number,
): { error: string } | { options: OptionInput[] } {
  if (items.length < 2 || items.length > 3) {
    return { error: "মেনুতে ২ বা ৩টা আইটেম থাকতে হবে" };
  }

  for (const item of items) {
    if (!item.isActive) {
      return { error: `"${item.name}" নিষ্ক্রিয়, মেনুতে রাখা যাবে না` };
    }
    if (item.price > budget) {
      return {
        error: `"${item.name}"-এর দাম (${formatTaka(item.price)}) বাজেটের (${formatTaka(budget)}) বেশি`,
      };
    }
  }

  const hasBothCategories = CATEGORIES.every((category) =>
    items.some((item) => item.category === category),
  );
  if (!hasBothCategories) {
    return { error: "অন্তত একটা হেলদি আর একটা আনহেলদি আইটেম লাগবে" };
  }

  const options: OptionInput[] = [];
  for (const category of CATEGORIES) {
    const inCategory = items.filter((item) => item.category === category);

    let defaultId: number;
    if (inCategory.length === 1) {
      defaultId = inCategory[0].id;
    } else {
      const chosen = inCategory.filter((item) => defaultIds.includes(item.id));
      if (chosen.length === 0) {
        return { error: `${CATEGORY_LABELS[category]} গ্রুপের ডিফল্ট আইটেম বাছাই করুন` };
      }
      if (chosen.length > 1) {
        return { error: `${CATEGORY_LABELS[category]} গ্রুপে একটাই ডিফল্ট আইটেম থাকতে পারে` };
      }
      defaultId = chosen[0].id;
    }

    for (const item of inCategory) {
      options.push({
        snackItemId: item.id,
        category,
        price: item.price,
        isDefault: item.id === defaultId,
      });
    }
  }

  return { options };
}

export type Selection = { snackItemId: number; isDefault: boolean };

// ইউজার আসলে কী পাবে: নিজের বাছাই, না থাকলে (খোলা মেনুতে) নিজের গ্রুপের ডিফল্ট
export function effectiveChoice<T extends { snackItemId: number; category: Category; isDefault: boolean }>(
  status: MenuStatus,
  selection: Selection | null,
  options: T[],
  defaultCategory: Category,
): { option: T; isDefault: boolean } | null {
  if (selection) {
    const option = options.find((o) => o.snackItemId === selection.snackItemId);
    return option ? { option, isDefault: selection.isDefault } : null;
  }
  // বন্ধ মেনুতে ডিফল্টগুলো আগেই সারি হিসেবে বসে গেছে; সারি না থাকলে কিছু বরাদ্দ নেই
  if (status !== "open") return null;

  const fallback = options.find((o) => o.category === defaultCategory && o.isDefault);
  return fallback ? { option: fallback, isDefault: true } : null;
}

export type PersonChoice = {
  userId: number;
  name: string;
  employeeId: string;
  snackItemId: number;
  isDefault: boolean;
};

export type ItemSummary = MenuOption & {
  people: PersonChoice[];
  count: number;
  chosenCount: number;
  defaultCount: number;
  subtotal: number;
};

export type MenuSummary = {
  items: ItemSummary[];
  totalPeople: number;
  totalCost: number;
  healthyCount: number;
  unhealthyCount: number;
};

export function summarizeMenu(options: MenuOption[], people: PersonChoice[]): MenuSummary {
  const items = options.map((option) => {
    const takers = people.filter((person) => person.snackItemId === option.snackItemId);
    const defaultCount = takers.filter((person) => person.isDefault).length;
    return {
      ...option,
      people: takers,
      count: takers.length,
      chosenCount: takers.length - defaultCount,
      defaultCount,
      subtotal: takers.length * option.price,
    };
  });

  const countIn = (category: Category) =>
    items.filter((item) => item.category === category).reduce((sum, item) => sum + item.count, 0);

  return {
    items,
    totalPeople: items.reduce((sum, item) => sum + item.count, 0),
    totalCost: items.reduce((sum, item) => sum + item.subtotal, 0),
    healthyCount: countIn("healthy"),
    unhealthyCount: countIn("unhealthy"),
  };
}

// ---------- ডাটাবেস থেকে পড়া ----------

function toMenu(row: Row): Menu {
  const text = (value: unknown) => (value === null ? null : String(value));
  return {
    id: Number(row.id),
    menuDate: String(row.menu_date),
    status: row.status as MenuStatus,
    cutoffAt: text(row.cutoff_at),
    note: text(row.note),
    openedAt: text(row.opened_at),
    closedAt: text(row.closed_at),
    deliveredAt: text(row.delivered_at),
  };
}

function toSnackForMenu(row: Row): SnackForMenu {
  return {
    id: Number(row.id),
    name: String(row.name),
    category: row.category as Category,
    price: Number(row.price),
    isActive: Number(row.is_active) === 1,
  };
}

export async function getMenu(menuId: number, now = new Date()): Promise<Menu | null> {
  await ensureClosedIfPastCutoff(menuId, now);

  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT * FROM daily_menus WHERE id = ?",
    args: [menuId],
  });
  return result.rows[0] ? toMenu(result.rows[0]) : null;
}

export async function getMenuOptions(menuId: number): Promise<MenuOption[]> {
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT mo.snack_item_id, mo.category, mo.price, mo.is_default,
                 s.name, s.description, s.image_url
          FROM menu_options mo
          JOIN snack_items s ON s.id = mo.snack_item_id
          WHERE mo.menu_id = ?
          ORDER BY mo.category, s.name`,
    args: [menuId],
  });
  return result.rows.map((row) => ({
    snackItemId: Number(row.snack_item_id),
    name: String(row.name),
    description: row.description === null ? null : String(row.description),
    imageUrl: row.image_url === null ? null : String(row.image_url),
    category: row.category as Category,
    price: Number(row.price),
    isDefault: Number(row.is_default) === 1,
  }));
}

export async function listMenus(now = new Date()): Promise<(Menu & { itemNames: string })[]> {
  await closeExpiredMenus(now);

  const db = await getDb();
  const result = await db.execute(
    `SELECT m.*,
            (SELECT GROUP_CONCAT(s.name, ', ')
             FROM menu_options mo JOIN snack_items s ON s.id = mo.snack_item_id
             WHERE mo.menu_id = m.id) AS item_names
     FROM daily_menus m
     ORDER BY m.menu_date DESC`,
  );
  return result.rows.map((row) => ({ ...toMenu(row), itemNames: String(row.item_names ?? "") }));
}

// মেনু ফর্মে দেখানোর আইটেম: সব সক্রিয় আইটেম + এই মেনুতে আগে থেকে থাকা আইটেম
export async function listSnacksForMenuForm(menuId: number | null): Promise<SnackForMenu[]> {
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT id, name, category, price, is_active
          FROM snack_items
          WHERE is_active = 1
             OR id IN (SELECT snack_item_id FROM menu_options WHERE menu_id = ?)
          ORDER BY category, name`,
    args: [menuId ?? 0],
  });
  return result.rows.map(toSnackForMenu);
}

// হোমে দেখানোর মেনু: আজকের (খসড়া বাদে) + আগেভাগে খোলা ভবিষ্যতের মেনু
export async function getHomeMenus(now = new Date()): Promise<Menu[]> {
  await closeExpiredMenus(now);

  const today = todayInDhaka(now);
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT * FROM daily_menus
          WHERE (menu_date = ? AND status != 'draft')
             OR (menu_date > ? AND status = 'open')
          ORDER BY menu_date`,
    args: [today, today],
  });
  return result.rows.map(toMenu);
}

export async function getUserSelection(menuId: number, userId: number): Promise<Selection | null> {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT snack_item_id, is_default FROM selections WHERE menu_id = ? AND user_id = ?",
    args: [menuId, userId],
  });
  const row = result.rows[0];
  if (!row) return null;
  return { snackItemId: Number(row.snack_item_id), isDefault: Number(row.is_default) === 1 };
}

// খোলা মেনু: প্রত্যেক সক্রিয় ইউজার, বাছাই না থাকলে তার গ্রুপের ডিফল্ট (সেভ হয় না)
// বন্ধ/ডেলিভারড মেনু: selections-এ যা সেভ আছে (ডিফল্টসহ), পরে কেউ নিষ্ক্রিয় হলেও হিসাব বদলায় না
export async function getPeopleChoices(menu: Menu): Promise<PersonChoice[]> {
  if (menu.status === "draft") return [];

  const db = await getDb();
  const result =
    menu.status === "open"
      ? await db.execute({
          sql: `SELECT u.id AS user_id, u.name, u.employee_id,
                       COALESCE(s.snack_item_id, d.snack_item_id) AS snack_item_id,
                       CASE WHEN s.snack_item_id IS NULL THEN 1 ELSE s.is_default END AS is_default
                FROM users u
                LEFT JOIN selections s ON s.menu_id = ? AND s.user_id = u.id
                LEFT JOIN menu_options d
                  ON d.menu_id = ? AND d.category = u.default_category AND d.is_default = 1
                WHERE u.is_active = 1
                ORDER BY u.name COLLATE NOCASE`,
          args: [menu.id, menu.id],
        })
      : await db.execute({
          sql: `SELECT u.id AS user_id, u.name, u.employee_id, s.snack_item_id, s.is_default
                FROM selections s
                JOIN users u ON u.id = s.user_id
                WHERE s.menu_id = ?
                ORDER BY u.name COLLATE NOCASE`,
          args: [menu.id],
        });

  return result.rows
    .filter((row) => row.snack_item_id !== null)
    .map((row) => ({
      userId: Number(row.user_id),
      name: String(row.name),
      employeeId: String(row.employee_id),
      snackItemId: Number(row.snack_item_id),
      isDefault: Number(row.is_default) === 1,
    }));
}

export async function getMenuSummary(
  menuId: number,
  now = new Date(),
): Promise<{ menu: Menu; summary: MenuSummary; people: PersonChoice[] } | null> {
  const menu = await getMenu(menuId, now);
  if (!menu) return null;

  const options = await getMenuOptions(menuId);
  const people = await getPeopleChoices(menu);
  return { menu, summary: summarizeMenu(options, people), people };
}

export type PastMenu = {
  id: number;
  menuDate: string;
  status: MenuStatus;
  totalPeople: number;
  totalCost: number;
  healthyCount: number;
  unhealthyCount: number;
};

export async function listPastMenus(now = new Date()): Promise<PastMenu[]> {
  await closeExpiredMenus(now);

  const db = await getDb();
  const result = await db.execute(
    `SELECT m.id, m.menu_date, m.status,
            COUNT(s.user_id) AS total_people,
            COALESCE(SUM(mo.price), 0) AS total_cost,
            COALESCE(SUM(CASE WHEN mo.category = 'healthy' THEN 1 ELSE 0 END), 0) AS healthy_count,
            COALESCE(SUM(CASE WHEN mo.category = 'unhealthy' THEN 1 ELSE 0 END), 0) AS unhealthy_count
     FROM daily_menus m
     LEFT JOIN selections s ON s.menu_id = m.id
     LEFT JOIN menu_options mo ON mo.menu_id = s.menu_id AND mo.snack_item_id = s.snack_item_id
     WHERE m.status IN ('closed', 'delivered')
     GROUP BY m.id
     ORDER BY m.menu_date DESC`,
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    menuDate: String(row.menu_date),
    status: row.status as MenuStatus,
    totalPeople: Number(row.total_people),
    totalCost: Number(row.total_cost),
    healthyCount: Number(row.healthy_count),
    unhealthyCount: Number(row.unhealthy_count),
  }));
}

export type MonthlyReportRow = {
  month: string; // "2026-09"
  menuCount: number;
  healthyCount: number;
  unhealthyCount: number;
  totalCost: number;
};

// শুধু বন্ধ আর ডেলিভারড মেনু গোনা হয়
export async function getMonthlyReport(now = new Date()): Promise<MonthlyReportRow[]> {
  await closeExpiredMenus(now);

  const db = await getDb();
  const result = await db.execute(
    `SELECT substr(m.menu_date, 1, 7) AS month,
            COUNT(DISTINCT m.id) AS menu_count,
            SUM(CASE WHEN mo.category = 'healthy' THEN 1 ELSE 0 END) AS healthy_count,
            SUM(CASE WHEN mo.category = 'unhealthy' THEN 1 ELSE 0 END) AS unhealthy_count,
            SUM(mo.price) AS total_cost
     FROM daily_menus m
     JOIN selections s ON s.menu_id = m.id
     JOIN menu_options mo ON mo.menu_id = s.menu_id AND mo.snack_item_id = s.snack_item_id
     WHERE m.status IN ('closed', 'delivered')
     GROUP BY month
     ORDER BY month DESC`,
  );
  return result.rows.map((row) => ({
    month: String(row.month),
    menuCount: Number(row.menu_count),
    healthyCount: Number(row.healthy_count),
    unhealthyCount: Number(row.unhealthy_count),
    totalCost: Number(row.total_cost),
  }));
}

export async function countSelections(menuId: number): Promise<number> {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT COUNT(*) AS count FROM selections WHERE menu_id = ?",
    args: [menuId],
  });
  return Number(result.rows[0].count);
}

// ---------- কাটঅফ আর বন্ধ করা ----------

function closeStatements(menuId: number, now: Date, reason: "cutoff" | "manual"): InStatement[] {
  const nowIso = now.toISOString();

  // কাটঅফের কারণে বন্ধ হলে আবার যাচাই করি cutoff পার হয়েছে কিনা (মাঝখানে reopen হয়ে থাকতে পারে)
  const closeMenu: InStatement =
    reason === "cutoff"
      ? {
          sql: `UPDATE daily_menus SET status = 'closed', closed_at = ?
                WHERE id = ? AND status = 'open' AND cutoff_at <= ?`,
          args: [nowIso, menuId, nowIso],
        }
      : {
          sql: `UPDATE daily_menus SET status = 'closed', closed_at = ?
                WHERE id = ? AND status = 'open'`,
          args: [nowIso, menuId],
        };

  return [
    closeMenu,
    // নিষ্ক্রিয় ইউজারের বাছাই বাদ, যাতে বন্ধ মেনুর হিসাব আর না বদলায়
    {
      sql: `DELETE FROM selections
            WHERE menu_id = ?
              AND user_id IN (SELECT id FROM users WHERE is_active = 0)
              AND EXISTS (SELECT 1 FROM daily_menus WHERE id = ? AND status = 'closed')`,
      args: [menuId, menuId],
    },
    // যারা কিছু বাছেনি, তারা নিজের ডিফল্ট গ্রুপের ডিফল্ট আইটেম পাবে
    {
      sql: `INSERT INTO selections (menu_id, user_id, snack_item_id, is_default, updated_at)
            SELECT mo.menu_id, u.id, mo.snack_item_id, 1, ?
            FROM users u
            JOIN menu_options mo
              ON mo.menu_id = ? AND mo.category = u.default_category AND mo.is_default = 1
            WHERE u.is_active = 1
              AND NOT EXISTS (SELECT 1 FROM selections s WHERE s.menu_id = mo.menu_id AND s.user_id = u.id)
              AND EXISTS (SELECT 1 FROM daily_menus m WHERE m.id = mo.menu_id AND m.status = 'closed')`,
      args: [nowIso, menuId],
    },
  ];
}

// cron নেই, তাই মেনু পড়া বা লেখার আগে এটা ডাকা হয়
export async function ensureClosedIfPastCutoff(menuId: number, now = new Date()): Promise<void> {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT 1 FROM daily_menus WHERE id = ? AND status = 'open' AND cutoff_at <= ?",
    args: [menuId, now.toISOString()],
  });
  if (result.rows.length > 0) {
    await db.batch(closeStatements(menuId, now, "cutoff"), "write");
  }
}

export async function closeExpiredMenus(now = new Date()): Promise<void> {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT id FROM daily_menus WHERE status = 'open' AND cutoff_at <= ?",
    args: [now.toISOString()],
  });
  for (const row of result.rows) {
    await db.batch(closeStatements(Number(row.id), now, "cutoff"), "write");
  }
}

// ---------- খসড়া তৈরি / এডিট ----------

export type DraftInput = {
  menuId: number | null; // null হলে নতুন মেনু
  menuDate: string;
  cutoffAt: string | null; // null হলে তারিখ + settings-এর ডিফল্ট সময়
  note: string;
  snackIds: number[];
  defaultIds: number[];
  createdBy: number;
};

export async function saveDraft(
  input: DraftInput,
  now = new Date(),
): Promise<{ error: string } | { menuId: number }> {
  if (input.menuId !== null) {
    const menu = await getMenu(input.menuId, now);
    if (!menu) return { error: "মেনু পাওয়া যায়নি" };
    if (menu.status !== "draft") return { error: "শুধু খসড়া মেনু এডিট করা যায়" };
  }

  if (input.menuDate < todayInDhaka(now)) {
    return { error: "আগের তারিখের মেনু বানানো যাবে না" };
  }

  const db = await getDb();
  const sameDate = await db.execute({
    sql: "SELECT id FROM daily_menus WHERE menu_date = ? AND id != ?",
    args: [input.menuDate, input.menuId ?? 0],
  });
  if (sameDate.rows.length > 0) {
    return { error: "এই তারিখে আগে থেকেই একটা মেনু আছে" };
  }

  const snackIds = [...new Set(input.snackIds)];
  if (snackIds.length < 2 || snackIds.length > 3) {
    return { error: "মেনুতে ২ বা ৩টা আইটেম থাকতে হবে" };
  }
  const placeholders = snackIds.map(() => "?").join(", ");
  const snackResult = await db.execute({
    sql: `SELECT id, name, category, price, is_active FROM snack_items WHERE id IN (${placeholders})`,
    args: snackIds,
  });
  if (snackResult.rows.length !== snackIds.length) {
    return { error: "কিছু আইটেম পাওয়া যায়নি" };
  }

  const settings = await getSettings();
  const validation = validateMenuItems(
    snackResult.rows.map(toSnackForMenu),
    input.defaultIds,
    settings.budgetPerPerson,
  );
  if ("error" in validation) return validation;

  const cutoffAt = input.cutoffAt ?? dhakaToIso(input.menuDate, settings.defaultCutoffTime);
  const note = input.note || null;
  const statements: InStatement[] = [];

  if (input.menuId === null) {
    statements.push({
      sql: "INSERT INTO daily_menus (menu_date, cutoff_at, note, created_by) VALUES (?, ?, ?, ?)",
      args: [input.menuDate, cutoffAt, note, input.createdBy],
    });
  } else {
    statements.push(
      {
        sql: `UPDATE daily_menus SET menu_date = ?, cutoff_at = ?, note = ?
              WHERE id = ? AND status = 'draft'`,
        args: [input.menuDate, cutoffAt, note, input.menuId],
      },
      {
        sql: `DELETE FROM menu_options
              WHERE menu_id = ? AND EXISTS (SELECT 1 FROM daily_menus WHERE id = ? AND status = 'draft')`,
        args: [input.menuId, input.menuId],
      },
    );
  }

  for (const option of validation.options) {
    statements.push({
      sql: `INSERT INTO menu_options (menu_id, snack_item_id, category, price, is_default)
            VALUES ((SELECT id FROM daily_menus WHERE menu_date = ?), ?, ?, ?, ?)`,
      args: [
        input.menuDate,
        option.snackItemId,
        option.category,
        option.price,
        option.isDefault ? 1 : 0,
      ],
    });
  }

  await db.batch(statements, "write");

  const saved = await db.execute({
    sql: "SELECT id FROM daily_menus WHERE menu_date = ?",
    args: [input.menuDate],
  });
  return { menuId: Number(saved.rows[0].id) };
}

// ---------- ইউজারের বাছাই (সফল হলে null, না হলে এরর বার্তা) ----------

const MENU_NOT_OPEN = "এই মেনু এখন আর বদলানো যাবে না";

export async function chooseSnack(
  menuId: number,
  userId: number,
  snackItemId: number,
  now = new Date(),
): Promise<string | null> {
  const menu = await getMenu(menuId, now);
  if (!menu || menu.status !== "open") return MENU_NOT_OPEN;

  // WHERE-এর শর্তগুলো লেখার মুহূর্তেই আবার যাচাই করে: মেনু খোলা, কাটঅফ বাকি, আইটেম মেনুতে আছে
  const nowIso = now.toISOString();
  const db = await getDb();
  const result = await db.execute({
    sql: `INSERT INTO selections (menu_id, user_id, snack_item_id, is_default, updated_at)
          SELECT mo.menu_id, ?, mo.snack_item_id, 0, ?
          FROM menu_options mo
          JOIN daily_menus m ON m.id = mo.menu_id
          WHERE mo.menu_id = ? AND mo.snack_item_id = ?
            AND m.status = 'open' AND m.cutoff_at > ?
          ON CONFLICT (menu_id, user_id) DO UPDATE SET
            snack_item_id = excluded.snack_item_id,
            is_default = 0,
            updated_at = excluded.updated_at`,
    args: [userId, nowIso, menuId, snackItemId, nowIso],
  });
  if (result.rowsAffected === 0) return "এই আইটেমটা বাছাই করা যায়নি";
  return null;
}

export async function clearChoice(menuId: number, userId: number, now = new Date()): Promise<string | null> {
  const menu = await getMenu(menuId, now);
  if (!menu || menu.status !== "open") return MENU_NOT_OPEN;

  const db = await getDb();
  await db.execute({
    sql: `DELETE FROM selections
          WHERE menu_id = ? AND user_id = ?
            AND EXISTS (SELECT 1 FROM daily_menus WHERE id = ? AND status = 'open' AND cutoff_at > ?)`,
    args: [menuId, userId, menuId, now.toISOString()],
  });
  return null;
}

// ---------- স্ট্যাটাস পরিবর্তন (সফল হলে null, না হলে এরর বার্তা) ----------
// অনুমোদিত: draft → open → closed → delivered, open → draft (কেউ না বাছলে), closed → open (reopen)

export async function openMenu(menuId: number, now = new Date()): Promise<string | null> {
  const menu = await getMenu(menuId, now);
  if (!menu) return "মেনু পাওয়া যায়নি";
  if (menu.status !== "draft") return "শুধু খসড়া মেনু খোলা যায়";
  if (!menu.cutoffAt || isPastCutoff(menu.cutoffAt, now)) {
    return "কাটঅফ সময় পার হয়ে গেছে। খসড়ায় ভবিষ্যতের একটা কাটঅফ দিন।";
  }

  // খোলার সময় আইটেমের বর্তমান দাম আর গ্রুপ দিয়ে আবার যাচাই, তারপর snapshot রিফ্রেশ
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT s.id, s.name, s.category, s.price, s.is_active, mo.is_default
          FROM menu_options mo
          JOIN snack_items s ON s.id = mo.snack_item_id
          WHERE mo.menu_id = ?`,
    args: [menuId],
  });
  const defaultIds = result.rows
    .filter((row) => Number(row.is_default) === 1)
    .map((row) => Number(row.id));
  const { budgetPerPerson } = await getSettings();
  const validation = validateMenuItems(result.rows.map(toSnackForMenu), defaultIds, budgetPerPerson);
  if ("error" in validation) return validation.error;

  await db.batch(
    [
      // আগে সব ডিফল্ট মুছি, নইলে "প্রতি গ্রুপে একটা ডিফল্ট" index মাঝপথে ভাঙতে পারে
      { sql: "UPDATE menu_options SET is_default = 0 WHERE menu_id = ?", args: [menuId] },
      ...validation.options.map((option) => ({
        sql: `UPDATE menu_options SET category = ?, price = ?, is_default = ?
              WHERE menu_id = ? AND snack_item_id = ?`,
        args: [option.category, option.price, option.isDefault ? 1 : 0, menuId, option.snackItemId],
      })),
      {
        sql: "UPDATE daily_menus SET status = 'open', opened_at = ? WHERE id = ? AND status = 'draft'",
        args: [now.toISOString(), menuId],
      },
    ],
    "write",
  );
  return null;
}

export async function closeMenu(menuId: number, now = new Date()): Promise<string | null> {
  const menu = await getMenu(menuId, now);
  if (!menu) return "মেনু পাওয়া যায়নি";
  if (menu.status !== "open") return "শুধু খোলা মেনু বন্ধ করা যায়";

  const db = await getDb();
  await db.batch(closeStatements(menuId, now, "manual"), "write");
  return null;
}

export async function backToDraft(menuId: number, now = new Date()): Promise<string | null> {
  const menu = await getMenu(menuId, now);
  if (!menu) return "মেনু পাওয়া যায়নি";
  if (menu.status !== "open") return "শুধু খোলা মেনু খসড়ায় ফেরানো যায়";

  const db = await getDb();
  const result = await db.execute({
    sql: `UPDATE daily_menus SET status = 'draft', opened_at = NULL
          WHERE id = ? AND status = 'open'
            AND NOT EXISTS (SELECT 1 FROM selections WHERE menu_id = ?)`,
    args: [menuId, menuId],
  });
  if (result.rowsAffected === 0) {
    return "কেউ ইতিমধ্যে বাছাই করেছে, তাই খসড়ায় ফেরানো যাবে না";
  }
  return null;
}

export async function reopenMenu(
  menuId: number,
  newCutoffAt: string,
  now = new Date(),
): Promise<string | null> {
  const menu = await getMenu(menuId, now);
  if (!menu) return "মেনু পাওয়া যায়নি";
  if (menu.status !== "closed") return "শুধু বন্ধ মেনু আবার খোলা যায়";
  if (isPastCutoff(newCutoffAt, now)) return "নতুন কাটঅফ ভবিষ্যতের সময় হতে হবে";

  const db = await getDb();
  await db.batch(
    [
      {
        sql: `UPDATE daily_menus SET status = 'open', cutoff_at = ?, closed_at = NULL
              WHERE id = ? AND status = 'closed'`,
        args: [newCutoffAt, menuId],
      },
      // বন্ধের সময় অটো-বসানো ডিফল্টগুলো মুছি; আবার বন্ধ হলে নতুন করে বসবে
      {
        sql: `DELETE FROM selections
              WHERE menu_id = ? AND is_default = 1
                AND EXISTS (SELECT 1 FROM daily_menus WHERE id = ? AND status = 'open')`,
        args: [menuId, menuId],
      },
    ],
    "write",
  );
  return null;
}

export async function markDelivered(menuId: number, now = new Date()): Promise<string | null> {
  const menu = await getMenu(menuId, now);
  if (!menu) return "মেনু পাওয়া যায়নি";
  if (menu.status !== "closed") return "শুধু বন্ধ মেনু ডেলিভারি হয়েছে মার্ক করা যায়";

  const db = await getDb();
  await db.execute({
    sql: "UPDATE daily_menus SET status = 'delivered', delivered_at = ? WHERE id = ? AND status = 'closed'",
    args: [now.toISOString(), menuId],
  });
  return null;
}

export async function deleteDraft(menuId: number, now = new Date()): Promise<string | null> {
  const menu = await getMenu(menuId, now);
  if (!menu) return "মেনু পাওয়া যায়নি";
  if (menu.status !== "draft") return "শুধু খসড়া মেনু মোছা যায়";

  const db = await getDb();
  await db.batch(
    [
      {
        sql: `DELETE FROM menu_options
              WHERE menu_id = ? AND EXISTS (SELECT 1 FROM daily_menus WHERE id = ? AND status = 'draft')`,
        args: [menuId, menuId],
      },
      { sql: "DELETE FROM daily_menus WHERE id = ? AND status = 'draft'", args: [menuId] },
    ],
    "write",
  );
  return null;
}
