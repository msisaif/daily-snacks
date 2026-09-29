import type { Metadata } from "next";
import {
  cardClass,
  CATEGORY_STYLES,
  CategorySplit,
  EmptyState,
  PageHeader,
  StatTile,
} from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { CATEGORIES, CATEGORY_SHORT_LABELS } from "@/lib/constants";
import { formatMonth, formatNumber, formatTaka } from "@/lib/format";
import { getMonthlyReport } from "@/lib/menu";

export const metadata: Metadata = { title: "রিপোর্ট" };

export default async function ReportsPage() {
  await requireAdmin();
  const rows = await getMonthlyReport();

  const totals = { menuCount: 0, healthyCount: 0, unhealthyCount: 0, totalCost: 0 };
  for (const row of rows) {
    totals.menuCount += row.menuCount;
    totals.healthyCount += row.healthyCount;
    totals.unhealthyCount += row.unhealthyCount;
    totals.totalCost += row.totalCost;
  }

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="মাসিক রিপোর্ট"
        description="শুধু বন্ধ আর ডেলিভারি হওয়া মেনু গোনা হয়েছে। দাম মেনু খোলার সময়ের।"
        icon="chart-bar"
        tone="violet"
      />

      {rows.length === 0 ? (
        <EmptyState icon="chart-bar" title="এখনো কোনো হিসাব নেই">
          মেনু বন্ধ হলে এখানে মাস অনুযায়ী খরচ দেখা যাবে।
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile label="মোট খরচ" value={formatTaka(totals.totalCost)} icon="wallet" tone="violet" />
            <StatTile label="মোট মেনু" value={`${formatNumber(totals.menuCount)}টা`} icon="clipboard" tone="sky" />
            <div className={`${cardClass} col-span-2`}>
              <p className="text-sm font-medium text-slate-500">কোন গ্রুপে কতজন (সব মাস মিলিয়ে)</p>
              <div className="mt-5">
                <CategorySplit healthy={totals.healthyCount} unhealthy={totals.unhealthyCount} />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200/70 bg-white shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">মাস</th>
                  <th className="px-5 py-3 text-right font-medium">মেনু</th>
                  {CATEGORIES.map((category) => (
                    <th key={category} className="px-5 py-3 text-right font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`size-2 rounded-full ${CATEGORY_STYLES[category].dot}`} />
                        {CATEGORY_SHORT_LABELS[category]}
                      </span>
                    </th>
                  ))}
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">ভাগ</th>
                  <th className="px-5 py-3 text-right font-medium">মোট খরচ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.month} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-semibold whitespace-nowrap text-slate-900">
                      {formatMonth(row.month)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{formatNumber(row.menuCount)}টা</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{formatNumber(row.healthyCount)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{formatNumber(row.unhealthyCount)}</td>
                    <td className="hidden w-40 px-5 py-3.5 sm:table-cell">
                      <CategorySplit healthy={row.healthyCount} unhealthy={row.unhealthyCount} compact />
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold whitespace-nowrap text-slate-900 tabular-nums">
                      {formatTaka(row.totalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
