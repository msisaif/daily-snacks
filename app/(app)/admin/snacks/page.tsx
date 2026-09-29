import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import {
  Badge,
  buttonClass,
  CATEGORY_STYLES,
  CategoryIcon,
  EmptyState,
  IconTile,
  PageHeader,
} from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { formatNumber, formatTaka } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "নাস্তা" };

export default async function SnacksPage() {
  await requireAdmin();

  const db = await getDb();
  const result = await db.execute(
    `SELECT id, name, description, price, category, image_url, is_active
     FROM snack_items
     ORDER BY is_active DESC, category, name COLLATE NOCASE`,
  );
  const snacks = result.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : "",
    price: Number(row.price),
    category: row.category as Category,
    imageUrl: row.image_url ? String(row.image_url) : "",
    isActive: Number(row.is_active) === 1,
  }));
  const { budgetPerPerson } = await getSettings();

  const newSnackButton = (
    <Link href="/admin/snacks/new" className={buttonClass.primary}>
      <Icon name="plus" className="size-4" />
      নতুন আইটেম
    </Link>
  );

  return (
    <div className="stagger space-y-8">
      <PageHeader
        title="নাস্তার আইটেম"
        description={`জনপ্রতি বাজেট ${formatTaka(budgetPerPerson)}`}
        icon="cookie"
        tone="orange"
        action={newSnackButton}
      />

      {snacks.length === 0 ? (
        <EmptyState icon="cookie" title="এখনো কোনো আইটেম নেই" action={newSnackButton}>
          প্রথম আইটেমটা যোগ করুন।
        </EmptyState>
      ) : (
        CATEGORIES.map((category) => {
          const items = snacks.filter((snack) => snack.category === category);
          const styles = CATEGORY_STYLES[category];
          return (
            <section key={category} className="space-y-3">
              <div className="flex items-center gap-2.5">
                <IconTile icon={styles.icon} tone={styles.tone} size="sm" />
                <h2 className={`font-display text-lg leading-tight font-bold ${styles.text}`}>{CATEGORY_LABELS[category]}</h2>
                <span className="text-sm text-slate-500">{formatNumber(items.length)}টি</span>
              </div>
              {items.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-500">
                  এই গ্রুপে আইটেম নেই
                </p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((snack) => (
                    <li key={snack.id}>
                      <Link
                        href={`/admin/snacks/${snack.id}`}
                        className={`group flex h-full items-center gap-3.5 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift ${
                          snack.isActive ? "" : "opacity-60 grayscale"
                        }`}
                      >
                        {snack.imageUrl ? (
                          <Image
                            src={snack.imageUrl}
                            alt=""
                            width={112}
                            height={112}
                            unoptimized
                            className="size-16 shrink-0 rounded-xl bg-slate-100 object-cover"
                          />
                        ) : (
                          <span
                            className={`flex size-16 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${
                              styles.placeholders[snack.id % styles.placeholders.length]
                            }`}
                          >
                            <CategoryIcon
                              category={category}
                              className="size-7 transition duration-300 group-hover:scale-110 group-hover:-rotate-6"
                            />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 leading-snug font-semibold text-slate-900">{snack.name}</p>
                          {snack.description && (
                            <p className="truncate text-xs text-slate-500">{snack.description}</p>
                          )}
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-900">{formatTaka(snack.price)}</span>
                            {!snack.isActive && <Badge>নিষ্ক্রিয়</Badge>}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
