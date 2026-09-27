import Link from "next/link";
import type { ReactNode } from "react";
import { CATEGORY_LABELS, type Category } from "@/lib/constants";

export const cardClass = "rounded-2xl border border-slate-200 bg-white p-4";

export const linkButtonClass =
  "inline-block shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700";

const BADGE_TONES = {
  gray: "bg-slate-100 text-slate-600",
  green: "bg-emerald-50 text-emerald-700",
  orange: "bg-orange-50 text-orange-700",
  amber: "bg-amber-50 text-amber-800",
  blue: "bg-sky-50 text-sky-700",
};

export function Badge({
  tone = "gray",
  children,
}: {
  tone?: keyof typeof BADGE_TONES;
  children: ReactNode;
}) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  );
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <Badge tone={category === "healthy" ? "green" : "orange"}>{CATEGORY_LABELS[category]}</Badge>
  );
}

export function PageHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {backHref && (
          <Link href={backHref} className="text-sm text-emerald-700 hover:underline">
            ← ফিরে যান
          </Link>
        )}
        <h1 className="truncate text-xl font-bold">{title}</h1>
      </div>
      {action}
    </div>
  );
}
