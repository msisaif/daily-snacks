import Link from "next/link";
import type { ReactNode } from "react";
import {
  CATEGORY_LABELS,
  MENU_STATUS_LABELS,
  type Category,
  type MenuStatus,
} from "@/lib/constants";

export const cardClass = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";

export const linkButtonClass =
  "inline-block shrink-0 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

// গ্রুপের রং সব জায়গায় একই: হেলদি সবুজ, আনহেলদি কমলা
export const CATEGORY_STYLES: Record<
  Category,
  { panel: string; icon: string; text: string; selected: string; dot: string }
> = {
  healthy: {
    panel: "border-emerald-100 bg-emerald-50/70",
    icon: "bg-emerald-100 text-emerald-700",
    text: "text-emerald-700",
    selected: "border-emerald-500 ring-2 ring-emerald-500",
    dot: "bg-emerald-500",
  },
  unhealthy: {
    panel: "border-orange-100 bg-orange-50/70",
    icon: "bg-orange-100 text-orange-700",
    text: "text-orange-700",
    selected: "border-orange-500 ring-2 ring-orange-500",
    dot: "bg-orange-500",
  },
};

const BADGE_TONES = {
  gray: "bg-slate-50 text-slate-600 ring-slate-500/20",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

export function Badge({
  tone = "gray",
  children,
}: {
  tone?: keyof typeof BADGE_TONES;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <Badge tone={category === "healthy" ? "green" : "orange"}>
      <span className={`size-1.5 rounded-full ${CATEGORY_STYLES[category].dot}`} />
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}

export function CategoryIcon({ category, className = "size-4" }: { category: Category; className?: string }) {
  if (category === "healthy") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z" />
        <path d="M5 19l8-8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 9h.01M14.5 10.5h.01M10 14.5h.01M14 15h.01" strokeWidth={3} />
    </svg>
  );
}

export function LogoMark() {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden>
        <path d="M4 9h13v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6V9Z" />
        <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
        <path d="M8 3v3M12 3v3" />
      </svg>
    </span>
  );
}

const STATUS_TONES: Record<MenuStatus, keyof typeof BADGE_TONES> = {
  draft: "gray",
  open: "green",
  closed: "amber",
  delivered: "blue",
};

export function MenuStatusBadge({ status }: { status: MenuStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{MENU_STATUS_LABELS[status]}</Badge>;
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
    <div className="mb-5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {backHref && (
          <Link href={backHref} className="text-sm font-medium text-emerald-700 hover:underline">
            ← ফিরে যান
          </Link>
        )}
        <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      {action}
    </div>
  );
}
