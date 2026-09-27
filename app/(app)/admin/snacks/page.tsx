import type { Metadata } from "next";
import Link from "next/link";
import { Badge, CategoryBadge, linkButtonClass, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import type { Category } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { formatTaka } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "নাস্তা" };

export default async function SnacksPage() {
  await requireAdmin();

  const db = await getDb();
  const result = await db.execute(
    `SELECT id, name, description, price, category, is_active
     FROM snack_items
     ORDER BY is_active DESC, category, name COLLATE NOCASE`,
  );
  const snacks = result.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : "",
    price: Number(row.price),
    category: row.category as Category,
    isActive: Number(row.is_active) === 1,
  }));
  const { budgetPerPerson } = await getSettings();

  return (
    <div>
      <PageHeader
        title="নাস্তার আইটেম"
        action={
          <Link href="/admin/snacks/new" className={linkButtonClass}>
            + নতুন আইটেম
          </Link>
        }
      />
      <p className="mb-3 text-sm text-slate-600">
        জনপ্রতি বাজেট: <span className="font-medium">{formatTaka(budgetPerPerson)}</span>
      </p>

      {snacks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          এখনো কোনো আইটেম নেই। প্রথম আইটেমটা যোগ করুন।
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {snacks.map((snack) => (
            <li key={snack.id}>
              <Link
                href={`/admin/snacks/${snack.id}`}
                className={`flex items-center justify-between gap-3 p-3 hover:bg-slate-50 ${
                  snack.isActive ? "" : "opacity-60"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{snack.name}</p>
                  {snack.description && (
                    <p className="truncate text-sm text-slate-500">{snack.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                  <span className="font-medium">{formatTaka(snack.price)}</span>
                  <CategoryBadge category={snack.category} />
                  {!snack.isActive && <Badge>নিষ্ক্রিয়</Badge>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
