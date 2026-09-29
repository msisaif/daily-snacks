import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import {
  CategorySplit,
  DateTile,
  EmptyState,
  listClass,
  listRowClass,
  MenuStatusBadge,
  PageHeader,
} from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { CATEGORY_SHORT_LABELS } from "@/lib/constants";
import { formatDateParts, formatMonth, formatNumber, formatTaka } from "@/lib/format";
import { listPastMenus, type PastMenu } from "@/lib/menu";

export const metadata: Metadata = { title: "ইতিহাস" };

export default async function HistoryPage() {
  await requireUser();
  const menus = await listPastMenus();

  const header = (
    <PageHeader
      title="আগের মেনুগুলো"
      description="মেনু বন্ধ হলে এখানে তার হিসাব দেখা যায়।"
      icon="history"
      tone="amber"
    />
  );

  if (menus.length === 0) {
    return (
      <div className="stagger space-y-6">
        {header}
        <EmptyState icon="history" title="এখনো কোনো মেনু বন্ধ হয়নি">
          মেনু বন্ধ হলে এখানে তার হিসাব দেখা যাবে।
        </EmptyState>
      </div>
    );
  }

  // মাস অনুযায়ী ভাগ: "2026-09" -> সেই মাসের মেনুগুলো (তারিখ নতুন থেকে পুরোনো)
  const byMonth = new Map<string, PastMenu[]>();
  for (const menu of menus) {
    const month = menu.menuDate.slice(0, 7);
    byMonth.set(month, [...(byMonth.get(month) ?? []), menu]);
  }

  return (
    <div className="stagger space-y-8">
      {header}
      {[...byMonth].map(([month, monthMenus]) => (
        <section key={month} className="space-y-3">
          <h2 className="flex items-center gap-3 font-display text-lg font-bold text-slate-700">
            {formatMonth(month)}
            <span className="h-px flex-1 bg-linear-to-r from-slate-200 to-transparent" />
          </h2>
          <ul className={listClass}>
            {monthMenus.map((menu) => (
              <li key={menu.id}>
                <Link href={`/history/${menu.id}`} className={listRowClass}>
                  <DateTile date={menu.menuDate} status={menu.status} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{formatDateParts(menu.menuDate).weekday}</p>
                    <p className="text-sm text-slate-500">
                      {formatNumber(menu.totalPeople)} জন · {CATEGORY_SHORT_LABELS.healthy}{" "}
                      {formatNumber(menu.healthyCount)} · {CATEGORY_SHORT_LABELS.unhealthy}{" "}
                      {formatNumber(menu.unhealthyCount)}
                    </p>
                    <div className="mt-2 max-w-60">
                      <CategorySplit healthy={menu.healthyCount} unhealthy={menu.unhealthyCount} compact />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-lg font-bold text-slate-900">{formatTaka(menu.totalCost)}</span>
                    <MenuStatusBadge status={menu.status} />
                  </div>
                  <Icon
                    name="chevron-right"
                    className="hidden size-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500 sm:block"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
