import type { Metadata } from "next";
import Link from "next/link";
import { cardClass, MenuStatusBadge, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate, formatMonth, formatNumber, formatTaka } from "@/lib/format";
import { listPastMenus, type PastMenu } from "@/lib/menu";

export const metadata: Metadata = { title: "ইতিহাস" };

export default async function HistoryPage() {
  await requireUser();
  const menus = await listPastMenus();

  if (menus.length === 0) {
    return (
      <div>
        <PageHeader title="আগের মেনুগুলো" />
        <p className={`${cardClass} py-10 text-center text-slate-600`}>
          এখনো কোনো মেনু বন্ধ হয়নি। মেনু বন্ধ হলে এখানে তার হিসাব দেখা যাবে।
        </p>
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
    <div className="space-y-6">
      <PageHeader title="আগের মেনুগুলো" />
      {[...byMonth].map(([month, monthMenus]) => (
        <section key={month}>
          <h2 className="mb-2 font-semibold text-slate-700">{formatMonth(month)}</h2>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {monthMenus.map((menu) => (
              <li key={menu.id}>
                <Link
                  href={`/history/${menu.id}`}
                  className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{formatDate(menu.menuDate)}</p>
                    <p className="text-sm text-slate-500">
                      {formatNumber(menu.totalPeople)} জন · হেলদি {formatNumber(menu.healthyCount)} ·
                      আনহেলদি {formatNumber(menu.unhealthyCount)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-semibold">{formatTaka(menu.totalCost)}</span>
                    <MenuStatusBadge status={menu.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
