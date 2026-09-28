import { Badge, cardClass, CATEGORY_STYLES, CategoryIcon } from "@/components/ui";
import { formatNumber, formatTaka } from "@/lib/format";
import { CATEGORIES, CATEGORY_LABELS, type MenuStatus } from "@/lib/constants";
import type { MenuSummary, PersonChoice } from "@/lib/menu";

type Props = {
  status: MenuStatus;
  summary: MenuSummary;
  people: PersonChoice[];
};

export function MenuSummaryView({ status, summary, people }: Props) {
  const itemById = new Map(summary.items.map((item) => [item.snackItemId, item]));
  const countByCategory = { healthy: summary.healthyCount, unhealthy: summary.unhealthyCount };

  return (
    <div className="space-y-5">
      {status === "open" && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-600/15">
          মেনু এখনো খোলা। যারা এখনো বাছেনি, তাদের ডিফল্ট ধরে হিসাব করা হয়েছে; কাটঅফের আগে এটা বদলাতে পারে।
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3">
        <Stat label="মোট লোক" value={`${formatNumber(summary.totalPeople)} জন`} />
        <Stat label="মোট খরচ" value={formatTaka(summary.totalCost)} />
      </dl>

      {/* হেলদি বাঁয়ে, আনহেলদি ডানে */}
      <div className="grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((category) => {
          const styles = CATEGORY_STYLES[category];
          const items = summary.items.filter((item) => item.category === category);
          return (
            <section key={category} className={`rounded-2xl border p-3 ${styles.panel}`}>
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={`flex size-7 items-center justify-center rounded-lg ${styles.icon}`}>
                  <CategoryIcon category={category} />
                </span>
                <h2 className={`font-semibold ${styles.text}`}>{CATEGORY_LABELS[category]}</h2>
                <span className="ml-auto text-sm font-semibold text-slate-700">
                  {formatNumber(countByCategory[category])} জন
                </span>
              </div>
              <ul className="space-y-2">
                {items.length === 0 && (
                  <li className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-4 text-center text-sm text-slate-500">
                    এই গ্রুপে আইটেম নেই
                  </li>
                )}
                {items.map((item) => (
                  <li key={item.snackItemId} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-1.5 font-semibold">
                          {item.name}
                          {item.isDefault && <Badge>ডিফল্ট</Badge>}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formatNumber(item.count)} জন × {formatTaka(item.price)}
                        </p>
                        <p className="text-xs text-slate-400">
                          নিজে বেছেছে {formatNumber(item.chosenCount)}, ডিফল্ট {formatNumber(item.defaultCount)}
                        </p>
                      </div>
                      <p className="shrink-0 font-bold tabular-nums">{formatTaka(item.subtotal)}</p>
                    </div>
                    {item.people.length > 0 && (
                      <details className="mt-2 text-sm">
                        <summary className="cursor-pointer font-medium text-emerald-700">কারা নিচ্ছে</summary>
                        <p className="mt-1 text-slate-600">
                          {item.people.map((person) => person.name).join(", ")}
                        </p>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <section className={cardClass}>
        <h2 className="mb-3 font-semibold">কে কী পাচ্ছে</h2>
        {people.length === 0 ? (
          <p className="text-sm text-slate-500">কেউ নেই।</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {people.map((person) => {
              const item = itemById.get(person.snackItemId);
              return (
                <li key={person.userId} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 truncate">
                    {person.name} <span className="text-slate-400">{person.employeeId}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {item && <span className={`size-2 rounded-full ${CATEGORY_STYLES[item.category].dot}`} />}
                    {item?.name}
                    {person.isDefault && <span className="text-slate-400">(ডিফল্ট)</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cardClass}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-xl font-bold tracking-tight">{value}</dd>
    </div>
  );
}
