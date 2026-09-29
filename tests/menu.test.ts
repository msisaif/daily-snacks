import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { after, beforeEach, describe, test } from "node:test";
import { getDb } from "../lib/db.ts";
import {
  addGuest,
  assignSnack,
  backToDraft,
  chooseSnack,
  clearChoice,
  closeMenu,
  deleteDraft,
  effectiveChoice,
  ensureClosedIfPastCutoff,
  getMenu,
  getMenuSummary,
  getMonthlyReport,
  isPastCutoff,
  listPastMenus,
  markDelivered,
  openMenu,
  removeGuest,
  reopenMenu,
  saveDraft,
  summarizeMenu,
  validateMenuItems,
  type SnackForMenu,
} from "../lib/menu.ts";
import { dhakaToIso } from "../lib/time.ts";

// প্রতিবার নতুন খালি ডাটাবেস, লোকাল local.db-তে হাত পড়ে না
process.env.DATABASE_URL = "file::memory:";
const db = await getDb();

const migrationsDir = new URL("../db/migrations/", import.meta.url);
for (const file of readdirSync(migrationsDir).filter((name) => name.endsWith(".sql")).sort()) {
  await db.executeMultiple(readFileSync(new URL(file, migrationsDir), "utf8"));
}

const ADMIN = 1, HASAN = 2, UMA = 3, INACTIVE = 4;
const BANANA = 1, JUICE = 2, SAMOSA = 3, CHIPS = 4, CAKE = 5;

await db.batch(
  [
    `INSERT INTO users (id, employee_id, name, password_hash, role, default_category, is_active) VALUES
       (1, 'A-1', 'Admin', 'x', 'admin', 'healthy', 1),
       (2, 'H-1', 'Hasan', 'x', 'member', 'healthy', 1),
       (3, 'U-1', 'Uma', 'x', 'member', 'unhealthy', 1),
       (4, 'I-1', 'Ina', 'x', 'member', 'healthy', 0)`,
    `INSERT INTO snack_items (id, name, price, category, is_active) VALUES
       (1, 'Banana', 10, 'healthy', 1),
       (2, 'Juice', 30, 'healthy', 1),
       (3, 'Samosa', 25, 'unhealthy', 1),
       (4, 'Chips', 20, 'unhealthy', 1),
       (5, 'Cake', 15, 'unhealthy', 0)`,
  ],
  "write",
);

// নির্দিষ্ট "এখন": ২৭ সেপ্টেম্বর ২০২৬, সকাল ১০টা (ঢাকা)
const NOW = new Date("2026-09-27T04:00:00.000Z");
const TOMORROW = "2026-09-28";
const CUTOFF = dhakaToIso(TOMORROW, "16:00");
const AFTER_CUTOFF = new Date(CUTOFF);

beforeEach(async () => {
  await db.batch(
    [
      "DELETE FROM selections",
      "DELETE FROM menu_guests",
      "DELETE FROM menu_options",
      "DELETE FROM daily_menus",
      "UPDATE users SET is_active = CASE id WHEN 4 THEN 0 ELSE 1 END",
      "UPDATE snack_items SET price = 10, category = 'healthy' WHERE id = 1",
      "UPDATE snack_items SET category = 'unhealthy' WHERE id = 3",
    ],
    "write",
  );
});

after(() => db.close());

async function createDraft(snackIds: number[], defaultIds: number[] = [], menuDate = TOMORROW) {
  const result = await saveDraft(
    { menuId: null, menuDate, cutoffAt: null, note: "", snackIds, defaultIds, createdBy: ADMIN },
    NOW,
  );
  assert.ok("menuId" in result, JSON.stringify(result));
  return result.menuId;
}

async function createOpenMenu(snackIds: number[], defaultIds: number[] = []) {
  const menuId = await createDraft(snackIds, defaultIds);
  assert.equal(await openMenu(menuId, NOW), null);
  return menuId;
}

async function selectionsOf(menuId: number) {
  const result = await db.execute({
    sql: "SELECT user_id, snack_item_id, is_default FROM selections WHERE menu_id = ? ORDER BY user_id",
    args: [menuId],
  });
  return result.rows.map((row) => [Number(row.user_id), Number(row.snack_item_id), Number(row.is_default)]);
}

async function assignedByOf(menuId: number, userId: number) {
  const result = await db.execute({
    sql: "SELECT assigned_by FROM selections WHERE menu_id = ? AND user_id = ?",
    args: [menuId, userId],
  });
  const value = result.rows[0]?.assigned_by;
  return value === null || value === undefined ? null : Number(value);
}

const snack = (id: number, category: "healthy" | "unhealthy", price = 10, isActive = true): SnackForMenu => ({
  id,
  name: `Item ${id}`,
  category,
  price,
  isActive,
});

describe("validateMenuItems", () => {
  test("a lone item in its group becomes that group's default", () => {
    const result = validateMenuItems([snack(1, "healthy"), snack(2, "unhealthy")], [], 30);
    assert.ok("options" in result);
    assert.ok(result.options.every((option) => option.isDefault));
  });

  test("needs 2 or 3 items", () => {
    assert.ok("error" in validateMenuItems([snack(1, "healthy")], [], 30));
    const four = [snack(1, "healthy"), snack(2, "healthy"), snack(3, "unhealthy"), snack(4, "unhealthy")];
    assert.ok("error" in validateMenuItems(four, [1, 3], 30));
  });

  test("needs at least one item from each group", () => {
    const result = validateMenuItems([snack(1, "healthy"), snack(2, "healthy")], [1], 30);
    assert.deepEqual(result, { error: "দুই গ্রুপ থেকেই অন্তত একটা করে আইটেম লাগবে" });
  });

  test("a group with two items needs exactly one default", () => {
    const items = [snack(1, "healthy"), snack(2, "healthy"), snack(3, "unhealthy")];
    assert.ok("error" in validateMenuItems(items, [], 30));
    assert.ok("error" in validateMenuItems(items, [1, 2], 30));

    const result = validateMenuItems(items, [2], 30);
    assert.ok("options" in result);
    const defaults = result.options.filter((option) => option.isDefault).map((option) => option.snackItemId);
    assert.deepEqual(defaults.sort(), [2, 3]);
  });

  test("rejects inactive items and prices above the budget", () => {
    assert.ok("error" in validateMenuItems([snack(1, "healthy"), snack(2, "unhealthy", 10, false)], [], 30));
    assert.ok("error" in validateMenuItems([snack(1, "healthy", 31), snack(2, "unhealthy")], [], 30));
    assert.ok("options" in validateMenuItems([snack(1, "healthy", 30), snack(2, "unhealthy")], [], 30));
  });
});

describe("pure helpers", () => {
  test("isPastCutoff is true exactly at the cutoff", () => {
    assert.equal(isPastCutoff(CUTOFF, new Date(AFTER_CUTOFF.getTime() - 1)), false);
    assert.equal(isPastCutoff(CUTOFF, AFTER_CUTOFF), true);
  });

  test("effectiveChoice: own pick, else group default while open, nothing when closed", () => {
    const options = [
      { snackItemId: 1, category: "healthy" as const, isDefault: true },
      { snackItemId: 3, category: "unhealthy" as const, isDefault: true },
    ];
    assert.equal(effectiveChoice("open", { snackItemId: 1, isDefault: false }, options, "unhealthy")?.option.snackItemId, 1);
    assert.equal(effectiveChoice("open", null, options, "unhealthy")?.option.snackItemId, 3);
    assert.equal(effectiveChoice("closed", null, options, "healthy"), null);
  });

  test("summarizeMenu counts people, own vs default picks and cost", () => {
    const option = (snackItemId: number, category: "healthy" | "unhealthy", price: number) => ({
      snackItemId, category, price, name: "", description: null, imageUrl: null, isDefault: false,
    });
    const person = (snackItemId: number, isDefault: boolean) => ({
      userId: 0, guestId: null, name: "", employeeId: "", snackItemId, isDefault, assignedByName: null,
    });
    const summary = summarizeMenu(
      [option(1, "healthy", 10), option(3, "unhealthy", 25)],
      [person(1, true), person(3, false), person(3, true)],
    );
    assert.equal(summary.totalPeople, 3);
    assert.equal(summary.guestCount, 0);
    assert.equal(summary.totalCost, 60);
    assert.equal(summary.healthyCount, 1);
    assert.equal(summary.unhealthyCount, 2);
    assert.deepEqual(
      [summary.items[1].chosenCount, summary.items[1].defaultCount, summary.items[1].subtotal],
      [1, 1, 50],
    );
  });
});

describe("drafts", () => {
  test("default cutoff is the menu date + settings time in Dhaka", async () => {
    const menuId = await createDraft([BANANA, SAMOSA]);
    const menu = await getMenu(menuId, NOW);
    assert.equal(menu?.cutoffAt, "2026-09-28T10:00:00.000Z");
    assert.equal(menu?.status, "draft");
  });

  test("rejects a second menu on the same date and dates in the past", async () => {
    await createDraft([BANANA, SAMOSA]);
    const input = { menuId: null, cutoffAt: null, note: "", snackIds: [BANANA, CHIPS], defaultIds: [], createdBy: ADMIN };
    assert.ok("error" in (await saveDraft({ ...input, menuDate: TOMORROW }, NOW)));
    assert.ok("error" in (await saveDraft({ ...input, menuDate: "2026-09-26" }, NOW)));
  });

  test("only drafts can be deleted", async () => {
    const draftId = await createDraft([BANANA, SAMOSA]);
    assert.equal(await deleteDraft(draftId, NOW), null);
    assert.equal(await getMenu(draftId, NOW), null);

    const openId = await createOpenMenu([BANANA, CHIPS]);
    assert.notEqual(await deleteDraft(openId, NOW), null);
  });
});

describe("opening a menu", () => {
  test("refreshes the price/category snapshot from the current snack", async () => {
    const menuId = await createDraft([BANANA, SAMOSA]);
    await db.execute("UPDATE snack_items SET price = 12 WHERE id = 1");
    assert.equal(await openMenu(menuId, NOW), null);

    const result = await db.execute({
      sql: "SELECT price FROM menu_options WHERE menu_id = ? AND snack_item_id = ?",
      args: [menuId, BANANA],
    });
    assert.equal(Number(result.rows[0].price), 12);
  });

  test("fails when the cutoff has already passed", async () => {
    const menuId = await createDraft([BANANA, SAMOSA]);
    assert.notEqual(await openMenu(menuId, AFTER_CUTOFF), null);
  });
});

describe("choosing", () => {
  test("choose, change and clear while open", async () => {
    const menuId = await createOpenMenu([BANANA, JUICE, SAMOSA], [BANANA]);

    assert.equal(await chooseSnack(menuId, HASAN, JUICE, NOW), null);
    assert.equal(await chooseSnack(menuId, HASAN, SAMOSA, NOW), null);
    assert.deepEqual(await selectionsOf(menuId), [[HASAN, SAMOSA, 0]]);

    assert.equal(await clearChoice(menuId, HASAN, NOW), null);
    assert.deepEqual(await selectionsOf(menuId), []);
  });

  test("rejects items that are not in the menu", async () => {
    const menuId = await createOpenMenu([BANANA, SAMOSA]);
    assert.notEqual(await chooseSnack(menuId, HASAN, CHIPS, NOW), null);
    assert.notEqual(await chooseSnack(menuId, HASAN, CAKE, NOW), null);
  });

  test("no changes after the cutoff", async () => {
    const menuId = await createOpenMenu([BANANA, SAMOSA]);
    await chooseSnack(menuId, HASAN, SAMOSA, NOW);

    assert.notEqual(await chooseSnack(menuId, HASAN, BANANA, AFTER_CUTOFF), null);
    assert.notEqual(await clearChoice(menuId, HASAN, AFTER_CUTOFF), null);
    assert.deepEqual((await selectionsOf(menuId)).find(([user]) => user === HASAN), [HASAN, SAMOSA, 0]);
  });
});

describe("closing", () => {
  test("lazy close fills defaults, keeps own picks, drops inactive users", async () => {
    const menuId = await createOpenMenu([BANANA, JUICE, SAMOSA], [BANANA]);
    await chooseSnack(menuId, HASAN, JUICE, NOW);
    await chooseSnack(menuId, INACTIVE, BANANA, NOW);

    await ensureClosedIfPastCutoff(menuId, NOW);
    assert.equal((await getMenu(menuId, NOW))?.status, "open");

    await ensureClosedIfPastCutoff(menuId, AFTER_CUTOFF);
    await ensureClosedIfPastCutoff(menuId, AFTER_CUTOFF);
    assert.equal((await getMenu(menuId, AFTER_CUTOFF))?.status, "closed");
    assert.deepEqual(await selectionsOf(menuId), [
      [ADMIN, BANANA, 1],
      [HASAN, JUICE, 0],
      [UMA, SAMOSA, 1],
    ]);
  });

  test("manual close works before the cutoff, only for open menus", async () => {
    const draftId = await createDraft([BANANA, SAMOSA], [], "2026-09-29");
    assert.notEqual(await closeMenu(draftId, NOW), null);

    const menuId = await createOpenMenu([BANANA, SAMOSA]);
    assert.equal(await closeMenu(menuId, NOW), null);
    assert.equal((await getMenu(menuId, NOW))?.status, "closed");
  });

  test("back to draft only while nobody has chosen", async () => {
    const menuId = await createOpenMenu([BANANA, SAMOSA]);
    assert.equal(await backToDraft(menuId, NOW), null);
    assert.equal(await openMenu(menuId, NOW), null);

    await chooseSnack(menuId, HASAN, BANANA, NOW);
    assert.notEqual(await backToDraft(menuId, NOW), null);
  });

  test("reopen needs a future cutoff and removes only the auto defaults", async () => {
    const menuId = await createOpenMenu([BANANA, SAMOSA]);
    await chooseSnack(menuId, HASAN, SAMOSA, NOW);
    await closeMenu(menuId, NOW);

    assert.notEqual(await reopenMenu(menuId, "2026-09-27T03:00:00.000Z", NOW), null);
    assert.equal(await reopenMenu(menuId, CUTOFF, NOW), null);
    assert.equal((await getMenu(menuId, NOW))?.status, "open");
    assert.deepEqual(await selectionsOf(menuId), [[HASAN, SAMOSA, 0]]);
  });

  test("delivered is final", async () => {
    const menuId = await createOpenMenu([BANANA, SAMOSA]);
    assert.notEqual(await markDelivered(menuId, NOW), null);
    await closeMenu(menuId, NOW);
    assert.equal(await markDelivered(menuId, NOW), null);

    assert.notEqual(await reopenMenu(menuId, CUTOFF, NOW), null);
    assert.notEqual(await closeMenu(menuId, NOW), null);
    assert.equal((await getMenu(menuId, NOW))?.status, "delivered");
  });
});

describe("summary and report", () => {
  test("open menu summary counts defaults on the fly without saving them", async () => {
    const menuId = await createOpenMenu([BANANA, JUICE, SAMOSA], [BANANA]);
    await chooseSnack(menuId, HASAN, JUICE, NOW);

    const data = await getMenuSummary(menuId, NOW);
    assert.equal(data?.summary.totalPeople, 3);
    assert.equal(data?.summary.totalCost, 10 + 30 + 25);
    assert.deepEqual(await selectionsOf(menuId), [[HASAN, JUICE, 0]]);
  });

  test("monthly report only counts closed and delivered menus", async () => {
    const openId = await createOpenMenu([BANANA, SAMOSA]);
    assert.deepEqual(await getMonthlyReport(NOW), []);

    await closeMenu(openId, NOW);
    const [september] = await getMonthlyReport(NOW);
    assert.deepEqual(september, {
      month: "2026-09",
      menuCount: 1,
      healthyCount: 2,
      unhealthyCount: 1,
      totalCost: 10 + 10 + 25,
    });
  });
});

describe("admin: picking for someone and guests", () => {
  test("assign while open records the admin; the employee's own change clears it", async () => {
    const menuId = await createOpenMenu([BANANA, JUICE, SAMOSA], [BANANA]);
    assert.equal(await assignSnack(menuId, HASAN, JUICE, ADMIN, NOW), null);
    assert.deepEqual(await selectionsOf(menuId), [[HASAN, JUICE, 0]]);
    assert.equal(await assignedByOf(menuId, HASAN), ADMIN);

    assert.equal(await chooseSnack(menuId, HASAN, SAMOSA, NOW), null);
    assert.equal(await assignedByOf(menuId, HASAN), null);
  });

  test("assign replaces the auto default on a closed menu; not on draft/delivered or for inactive users", async () => {
    const draftId = await createDraft([BANANA, SAMOSA], [], "2026-09-29");
    assert.notEqual(await assignSnack(draftId, HASAN, BANANA, ADMIN, NOW), null);

    const menuId = await createOpenMenu([BANANA, SAMOSA]);
    await closeMenu(menuId, NOW);
    assert.equal(await assignSnack(menuId, UMA, BANANA, ADMIN, NOW), null);
    assert.deepEqual((await selectionsOf(menuId)).find(([user]) => user === UMA), [UMA, BANANA, 0]);
    assert.notEqual(await assignSnack(menuId, INACTIVE, BANANA, ADMIN, NOW), null);
    assert.notEqual(await assignSnack(menuId, HASAN, CHIPS, ADMIN, NOW), null);

    await markDelivered(menuId, NOW);
    assert.notEqual(await assignSnack(menuId, HASAN, SAMOSA, ADMIN, NOW), null);
    assert.notEqual(await addGuest(menuId, SAMOSA, "", ADMIN, NOW), null);
  });

  test("guests get running numbers and count in the summary, history and report", async () => {
    const menuId = await createOpenMenu([BANANA, SAMOSA]);
    assert.equal(await addGuest(menuId, SAMOSA, "", ADMIN, NOW), null);
    assert.equal(await addGuest(menuId, BANANA, "Rahim", ADMIN, NOW), null);
    assert.notEqual(await addGuest(menuId, CHIPS, "", ADMIN, NOW), null);

    const data = await getMenuSummary(menuId, NOW);
    const guests = data?.people.filter((person) => person.guestId !== null) ?? [];
    assert.deepEqual(guests.map((guest) => guest.name), ["গেস্ট ১", "গেস্ট ২ (Rahim)"]);
    assert.equal(data?.summary.guestCount, 2);
    assert.equal(data?.summary.totalPeople, 3 + 2);

    // মোছা নম্বর আবার ব্যবহার হয় না
    assert.equal(await removeGuest(menuId, Number(guests[0].guestId), NOW), null);
    assert.equal(await addGuest(menuId, SAMOSA, "", ADMIN, NOW), null);
    const after = await getMenuSummary(menuId, NOW);
    assert.deepEqual(
      after?.people.filter((person) => person.guestId !== null).map((guest) => guest.name),
      ["গেস্ট ২ (Rahim)", "গেস্ট ৩"],
    );

    // এমপ্লয়ি: Admin ও Hasan কলা, Uma সমুচা; গেস্ট: কলা আর সমুচা
    await closeMenu(menuId, NOW);
    const [september] = await getMonthlyReport(NOW);
    assert.equal(september.totalCost, 10 + 10 + 25 + 10 + 25);
    assert.deepEqual([september.healthyCount, september.unhealthyCount], [3, 2]);
    const [past] = await listPastMenus(NOW);
    assert.equal(past.totalPeople, 5);
  });

  test("guests block back-to-draft; reopen keeps guests and admin picks", async () => {
    const menuId = await createOpenMenu([BANANA, SAMOSA]);
    await addGuest(menuId, BANANA, "", ADMIN, NOW);
    assert.notEqual(await backToDraft(menuId, NOW), null);

    await closeMenu(menuId, NOW);
    await assignSnack(menuId, UMA, BANANA, ADMIN, NOW);
    assert.equal(await reopenMenu(menuId, CUTOFF, NOW), null);
    assert.deepEqual(await selectionsOf(menuId), [[UMA, BANANA, 0]]);
    assert.equal((await getMenuSummary(menuId, NOW))?.summary.guestCount, 1);
  });
});
