import { Badge, cardClass, CategoryBadge } from "@/components/ui";
import { formatNumber, formatTaka } from "@/lib/format";
import type { MenuStatus } from "@/lib/constants";
import type { MenuSummary, PersonChoice } from "@/lib/menu";

type Props = {
  status: MenuStatus;
  summary: MenuSummary;
  people: PersonChoice[];
};

export function MenuSummaryView({ status, summary, people }: Props) {
  const itemName = new Map(summary.items.map((item) => [item.snackItemId, item.name]));

  return (
    <div className="space-y-4">
      {status === "open" && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          মেনু এখনো খোলা। যারা এখনো বাছেনি, তাদের ডিফল্ট ধরে হিসাব করা হয়েছে; কাটঅফের আগে এটা বদলাতে পারে।
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="মোট লোক" value={`${formatNumber(summary.totalPeople)} জন`} />
        <Stat label="মোট খরচ" value={formatTaka(summary.totalCost)} />
        <Stat label="হেলদি" value={`${formatNumber(summary.healthyCount)} জন`} />
        <Stat label="আনহেলদি" value={`${formatNumber(summary.unhealthyCount)} জন`} />
      </dl>

      <section className={cardClass}>
        <h2 className="mb-3 font-semibold">আইটেম অনুযায়ী</h2>
        <ul className="divide-y divide-slate-100">
          {summary.items.map((item) => (
            <li key={item.snackItemId} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-1 font-medium">
                    {item.name}
                    <CategoryBadge category={item.category} />
                    {item.isDefault && <Badge>ডিফল্ট</Badge>}
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatNumber(item.count)} জন × {formatTaka(item.price)}
                    <span className="text-slate-400">
                      {" "}
                      (নিজে বেছেছে {formatNumber(item.chosenCount)}, ডিফল্ট {formatNumber(item.defaultCount)})
                    </span>
                  </p>
                </div>
                <p className="shrink-0 font-semibold">{formatTaka(item.subtotal)}</p>
              </div>
              {item.people.length > 0 && (
                <details className="mt-1 text-sm">
                  <summary className="cursor-pointer text-emerald-700">কারা নিচ্ছে</summary>
                  <p className="mt-1 text-slate-600">
                    {item.people.map((person) => person.name).join(", ")}
                  </p>
                </details>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className={cardClass}>
        <h2 className="mb-3 font-semibold">কে কী পাচ্ছে</h2>
        {people.length === 0 ? (
          <p className="text-sm text-slate-500">কেউ নেই।</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {people.map((person) => (
              <li key={person.userId} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0 truncate">
                  {person.name} <span className="text-slate-400">{person.employeeId}</span>
                </span>
                <span className="shrink-0">
                  {itemName.get(person.snackItemId)}
                  {person.isDefault && <span className="text-slate-400"> (ডিফল্ট)</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cardClass}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-lg font-bold">{value}</dd>
    </div>
  );
}
