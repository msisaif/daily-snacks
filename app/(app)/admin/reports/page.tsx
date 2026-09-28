import type { Metadata } from "next";
import { cardClass, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatMonth, formatNumber, formatTaka } from "@/lib/format";
import { getMonthlyReport } from "@/lib/menu";

export const metadata: Metadata = { title: "রিপোর্ট" };

export default async function ReportsPage() {
  await requireAdmin();
  const rows = await getMonthlyReport();

  return (
    <div>
      <PageHeader title="মাসিক রিপোর্ট" />
      <p className="mb-3 text-sm text-slate-600">
        শুধু বন্ধ আর ডেলিভারি হওয়া মেনু গোনা হয়েছে। দাম মেনু খোলার সময়ের।
      </p>

      {rows.length === 0 ? (
        <p className={`${cardClass} py-10 text-center text-slate-600`}>এখনো কোনো হিসাব নেই।</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">মাস</th>
                <th className="px-3 py-2 text-right font-medium">মেনু</th>
                <th className="px-3 py-2 text-right font-medium">হেলদি</th>
                <th className="px-3 py-2 text-right font-medium">আনহেলদি</th>
                <th className="px-3 py-2 text-right font-medium">মোট খরচ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.month}>
                  <td className="whitespace-nowrap px-3 py-2 font-medium">{formatMonth(row.month)}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.menuCount)}টা</td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.healthyCount)}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(row.unhealthyCount)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-semibold">
                    {formatTaka(row.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
