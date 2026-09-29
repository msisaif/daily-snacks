import {
  Avatar,
  Badge,
  Callout,
  cardClass,
  CardTitle,
  CATEGORY_STYLES,
  CategorySplit,
  DefaultBadge,
  IconTile,
  StatTile,
} from "@/components/ui";
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
    <div className="stagger space-y-6">
      {status === "open" && (
        <Callout tone="amber" icon="clock">
          মেনু এখনো খোলা। যারা এখনো বাছেনি, তাদের ডিফল্ট ধরে হিসাব করা হয়েছে; কাটঅফের আগে এটা বদলাতে পারে।
        </Callout>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="মোট লোক"
          value={`${formatNumber(summary.totalPeople)} জন`}
          note={summary.guestCount > 0 ? `গেস্ট ${formatNumber(summary.guestCount)} জনসহ` : undefined}
          icon="users"
          tone="sky"
        />
        <StatTile label="মোট খরচ" value={formatTaka(summary.totalCost)} icon="wallet" tone="violet" />
        <div className={`${cardClass} col-span-2`}>
          <p className="text-sm font-medium text-slate-500">কোন গ্রুপে কতজন</p>
          <div className="mt-5">
            <CategorySplit healthy={summary.healthyCount} unhealthy={summary.unhealthyCount} />
          </div>
        </div>
      </div>

      {/* ফ্রেশ (healthy) বাঁয়ে, ক্রিসপি (unhealthy) ডানে */}
      <div className="grid gap-5 sm:grid-cols-2">
        {CATEGORIES.map((category) => {
          const styles = CATEGORY_STYLES[category];
          const items = summary.items.filter((item) => item.category === category);
          return (
            <section key={category} className={`min-w-0 rounded-3xl border p-3 sm:p-4 ${styles.panel}`}>
              <div className="mb-3 flex items-center gap-2.5 px-1 pt-1">
                <IconTile icon={styles.icon} tone={styles.tone} size="sm" />
                <h2 className={`font-display text-lg leading-tight font-bold ${styles.text}`}>{CATEGORY_LABELS[category]}</h2>
                <span className="ml-auto shrink-0 rounded-full bg-white/80 px-2.5 py-0.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200/60">
                  {formatNumber(countByCategory[category])} জন
                </span>
              </div>
              <ul className="space-y-3">
                {items.length === 0 && (
                  <li className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-center text-sm text-slate-500">
                    এই গ্রুপে আইটেম নেই
                  </li>
                )}
                {items.map((item) => (
                  <li key={item.snackItemId} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-1.5 font-semibold text-slate-900">
                          {item.name}
                          {item.isDefault && <DefaultBadge />}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-600">
                          {formatNumber(item.count)} জন × {formatTaka(item.price)}
                        </p>
                      </div>
                      <p className="shrink-0 text-lg font-bold text-slate-900">{formatTaka(item.subtotal)}</p>
                    </div>
                    <div
                      className={`mt-3 h-1.5 rounded-full ${styles.track}`}
                      title={`${formatNumber(item.count)} জন`}
                    >
                      <div
                        className={`h-full origin-left animate-grow rounded-full ${styles.dot}`}
                        style={{
                          width: `${summary.totalPeople > 0 ? (item.count / summary.totalPeople) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      নিজে বেছেছে {formatNumber(item.chosenCount)}, ডিফল্ট {formatNumber(item.defaultCount)}
                    </p>
                    {item.people.length > 0 && (
                      <details className="mt-2 text-sm">
                        <summary className="cursor-pointer font-medium text-emerald-700 marker:text-emerald-500">
                          কারা নিচ্ছে
                        </summary>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.people.map((person) => (
                            <span
                              key={person.guestId === null ? `u${person.userId}` : `g${person.guestId}`}
                              className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 py-0.5 pr-2.5 pl-0.5 text-xs text-slate-700 ring-1 ring-slate-200/70"
                            >
                              <Avatar name={person.name} className="size-5 text-[10px]" />
                              {person.name}
                            </span>
                          ))}
                        </div>
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
        <CardTitle title="কে কী পাচ্ছে" icon="users" tone="rose" />
        {people.length === 0 ? (
          <p className="text-sm text-slate-500">কেউ নেই।</p>
        ) : (
          <ul className="grid gap-x-8 text-sm lg:grid-cols-2">
            {people.map((person) => {
              const item = itemById.get(person.snackItemId);
              return (
                <li
                  key={person.guestId === null ? `u${person.userId}` : `g${person.guestId}`}
                  className="flex items-center gap-3 border-b border-slate-100 py-3"
                >
                  <Avatar name={person.name} />
                  {/* মোবাইলে আইটেম নামের নিচে, বড় স্ক্রিনে ডানে */}
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5">
                        <span className="truncate font-medium text-slate-900">{person.name}</span>
                        {person.employeeId ? (
                          <span className="shrink-0 text-xs text-slate-400">{person.employeeId}</span>
                        ) : (
                          <Badge tone="blue">গেস্ট</Badge>
                        )}
                      </p>
                      {person.assignedByName && (
                        <p className="text-xs text-slate-400">দিয়েছেন: {person.assignedByName}</p>
                      )}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-slate-700 sm:mt-0 sm:shrink-0">
                      {item && <span className={`size-2 shrink-0 rounded-full ${CATEGORY_STYLES[item.category].dot}`} />}
                      {item?.name}
                      {person.isDefault && <span className="text-xs text-slate-400">(ডিফল্ট)</span>}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
