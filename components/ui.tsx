import Link from "next/link";
import { useId, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  MENU_STATUS_LABELS,
  type Category,
  type MenuStatus,
} from "@/lib/constants";
import { formatDateParts, formatNumber } from "@/lib/format";

// হেডার, নেভিগেশন আর সব পেজ এই একই চওড়ায়
export const containerClass = "mx-auto w-full max-w-5xl px-4 sm:px-6";

export const cardClass = "rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card sm:p-6";

// লিংকের তালিকা: কার্ডের মতো, কিন্তু প্যাডিং প্রতিটা সারির ভেতরে
export const listClass =
  "divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-card";

export const listRowClass = "group flex items-center gap-4 px-4 py-3.5 transition hover:bg-slate-50/80 sm:px-5";

const BUTTON_BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

export const buttonClass = {
  primary: `${BUTTON_BASE} bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-600/30 focus-visible:outline-emerald-600`,
  secondary: `${BUTTON_BASE} border border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 hover:shadow-md focus-visible:outline-slate-400`,
  danger: `${BUTTON_BASE} bg-linear-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-600/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-600/30 focus-visible:outline-rose-600`,
};

const TONES = {
  emerald: "from-emerald-400 to-teal-600 shadow-emerald-500/30",
  orange: "from-amber-400 to-orange-500 shadow-orange-500/30",
  sky: "from-sky-400 to-blue-600 shadow-sky-500/30",
  violet: "from-violet-400 to-purple-600 shadow-violet-500/30",
  rose: "from-pink-400 to-rose-500 shadow-rose-500/30",
  amber: "from-yellow-400 to-amber-500 shadow-amber-500/30",
};

export type Tone = keyof typeof TONES;

const ICON_TILE_SIZES = {
  sm: { box: "size-9 rounded-xl", icon: "size-4.5" },
  md: { box: "size-12 rounded-2xl", icon: "size-6" },
  lg: { box: "size-16 rounded-3xl", icon: "size-8" },
};

export function IconTile({
  icon,
  tone = "emerald",
  size = "md",
}: {
  icon: IconName;
  tone?: Tone;
  size?: keyof typeof ICON_TILE_SIZES;
}) {
  const sizes = ICON_TILE_SIZES[size];
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-linear-to-br text-white shadow-md ${TONES[tone]} ${sizes.box}`}
    >
      <Icon name={icon} className={sizes.icon} />
    </span>
  );
}

// গ্রুপের রং সব জায়গায় একই: ফ্রেশ (healthy) সবুজ, ক্রিসপি (unhealthy) কমলা
export const CATEGORY_STYLES: Record<
  Category,
  {
    icon: IconName;
    tone: Tone;
    panel: string;
    text: string;
    selected: string;
    dot: string;
    track: string;
    placeholders: string[];
  }
> = {
  healthy: {
    icon: "salad",
    tone: "emerald",
    panel: "border-emerald-200/60 bg-linear-to-b from-emerald-50 to-emerald-50/20",
    text: "text-emerald-700",
    selected: "border-emerald-500 ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-600/15",
    dot: "bg-emerald-500",
    track: "bg-emerald-100",
    placeholders: [
      "from-emerald-100 to-teal-50 text-emerald-600",
      "from-lime-100 to-emerald-50 text-lime-700",
      "from-teal-100 to-cyan-50 text-teal-600",
    ],
  },
  unhealthy: {
    icon: "cookie",
    tone: "orange",
    panel: "border-orange-200/60 bg-linear-to-b from-orange-50 to-orange-50/20",
    text: "text-orange-700",
    selected: "border-orange-500 ring-2 ring-orange-500/60 shadow-lg shadow-orange-600/15",
    dot: "bg-orange-500",
    track: "bg-orange-100",
    placeholders: [
      "from-orange-100 to-amber-50 text-orange-600",
      "from-amber-100 to-yellow-50 text-amber-700",
      "from-rose-100 to-orange-50 text-rose-500",
    ],
  },
};

const BADGE_TONES = {
  gray: "bg-slate-100 text-slate-600 ring-slate-500/15",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/25",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-sans text-xs font-medium whitespace-nowrap ring-1 ring-inset ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function DefaultBadge() {
  return (
    <Badge tone="amber">
      <Icon name="star" className="size-3" />
      ডিফল্ট
    </Badge>
  );
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <Badge tone={category === "healthy" ? "green" : "orange"}>
      <CategoryIcon category={category} className="size-3" />
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}

export function CategoryIcon({ category, className = "size-4" }: { category: Category; className?: string }) {
  return <Icon name={CATEGORY_STYLES[category].icon} className={className} />;
}

const STATUS_TONES: Record<MenuStatus, keyof typeof BADGE_TONES> = {
  draft: "gray",
  open: "green",
  closed: "amber",
  delivered: "blue",
};

export function MenuStatusBadge({ status }: { status: MenuStatus }) {
  return (
    <Badge tone={STATUS_TONES[status]}>
      {status === "open" && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
        </span>
      )}
      {MENU_STATUS_LABELS[status]}
    </Badge>
  );
}

// কামড় দেওয়া বিস্কুটের মতো টাইলে ধোঁয়া-ওঠা কাপ; app/icon.svg-ও একই নকশা
export function LogoMark({ className = "size-10" }: { className?: string }) {
  const id = useId();
  const gradientId = `${id}-bg`;
  const glossId = `${id}-gloss`;
  const maskId = `${id}-bite`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={`shrink-0 drop-shadow-[0_6px_10px_rgb(5_150_105/0.28)] ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="0.55" stopColor="#059669" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
        <radialGradient id={glossId} cx="0.25" cy="0.1" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={maskId}>
          <rect width="64" height="64" fill="#fff" />
          <circle cx="64" cy="0" r="12.5" fill="#000" />
          <circle cx="51.7" cy="2.2" r="4.5" fill="#000" />
          <circle cx="55.2" cy="8.8" r="4.5" fill="#000" />
          <circle cx="61.8" cy="12.3" r="4.5" fill="#000" />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <rect width="64" height="64" rx="16" fill={`url(#${gradientId})`} />
        <rect width="64" height="64" rx="16" fill={`url(#${glossId})`} />
      </g>
      <g
        transform="translate(10 13.5) scale(1.75)"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 9h13v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6V9Z" />
        <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
        <path d="M8 3v3" className="animate-steam" />
        <path d="M12 3v3" className="animate-steam [animation-delay:1.5s]" />
      </g>
    </svg>
  );
}

const AVATAR_TONES = [
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-sky-400 to-blue-500",
  "from-violet-400 to-purple-500",
  "from-pink-400 to-rose-500",
  "from-lime-400 to-green-600",
];

// নাম থেকে সবসময় একই রং আসে
export function Avatar({ name, className = "size-9 text-sm" }: { name: string; className?: string }) {
  const letters = Array.from(name);
  const code = letters.reduce((sum, letter) => sum + (letter.codePointAt(0) ?? 0), 0);
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-linear-to-br font-semibold text-white shadow-sm ${AVATAR_TONES[code % AVATAR_TONES.length]} ${className}`}
    >
      {letters[0]}
    </span>
  );
}

const DATE_TILE_TONES: Record<MenuStatus, string> = {
  draft: "border-slate-200 from-slate-100 text-slate-600",
  open: "border-emerald-200 from-emerald-50 text-emerald-700",
  closed: "border-amber-200 from-amber-50 text-amber-700",
  delivered: "border-sky-200 from-sky-50 text-sky-700",
};

export function DateTile({ date, status }: { date: string; status: MenuStatus }) {
  const { day, month } = formatDateParts(date);
  return (
    <span
      className={`flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl border bg-linear-to-b to-white shadow-sm ${DATE_TILE_TONES[status]}`}
    >
      <span className="font-display text-xl leading-none font-bold">{day}</span>
      <span className="mt-1 text-[11px] leading-none font-medium text-slate-500">{month}</span>
    </span>
  );
}

export function PageHeader({
  title,
  description,
  icon,
  tone = "emerald",
  badge,
  backHref,
  action,
}: {
  title: string;
  description?: ReactNode;
  icon?: IconName;
  tone?: Tone;
  badge?: ReactNode;
  backHref?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="group mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/70 transition hover:text-emerald-700 hover:ring-emerald-300"
          >
            <Icon name="arrow-left" className="size-4 transition group-hover:-translate-x-0.5" />
            ফিরে যান
          </Link>
        )}
        <div className="flex items-center gap-4">
          {icon && <IconTile icon={icon} tone={tone} />}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="font-display text-2xl leading-tight font-bold tracking-tight wrap-break-word text-slate-900 sm:text-3xl">
                {title}
              </h1>
              {badge}
            </div>
            {description && <div className="mt-1 text-sm text-slate-500">{description}</div>}
          </div>
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardTitle({
  title,
  description,
  icon,
  tone = "emerald",
  action,
}: {
  title: string;
  description?: ReactNode;
  icon?: IconName;
  tone?: Tone;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      {icon && <IconTile icon={icon} tone={tone} size="sm" />}
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-lg leading-tight font-bold text-slate-900">{title}</h2>
        {description && <div className="mt-1 text-sm text-slate-500">{description}</div>}
      </div>
      {action}
    </div>
  );
}

const CALLOUT_TONES = {
  amber: { box: "border-amber-200/80 bg-amber-50/90 text-amber-900", icon: "text-amber-500" },
  sky: { box: "border-sky-200/80 bg-sky-50/90 text-sky-900", icon: "text-sky-500" },
};

export function Callout({
  tone = "sky",
  icon = "info",
  children,
}: {
  tone?: keyof typeof CALLOUT_TONES;
  icon?: IconName;
  children: ReactNode;
}) {
  const styles = CALLOUT_TONES[tone];
  return (
    <div className={`flex gap-3 rounded-2xl border px-4 py-3 text-sm leading-relaxed ${styles.box}`}>
      <Icon name={icon} className={`mt-0.5 size-4.5 shrink-0 ${styles.icon}`} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: IconName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={`${cardClass} flex flex-col items-center px-6 py-14 text-center`}>
      <div className="relative isolate mb-6">
        <span className="absolute inset-0 -z-10 scale-150 rounded-full bg-emerald-300/40 blur-2xl" />
        <span className="flex size-16 animate-float items-center justify-center rounded-3xl bg-linear-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
          <Icon name={icon} className="size-8" />
        </span>
      </div>
      <p className="font-display text-xl font-bold text-slate-900">{title}</p>
      {children && <div className="mt-2 max-w-md text-sm text-slate-500">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  note,
  icon,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  icon: IconName;
  tone: Tone;
}) {
  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <IconTile icon={icon} tone={tone} size="sm" />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{value}</p>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

// কোন গ্রুপে কতজন: দুই রঙের বার, নিচে সংখ্যা (compact হলে শুধু বার)
export function CategorySplit({
  healthy,
  unhealthy,
  compact = false,
}: {
  healthy: number;
  unhealthy: number;
  compact?: boolean;
}) {
  const counts: Record<Category, number> = { healthy, unhealthy };
  const total = healthy + unhealthy;

  return (
    <div>
      <div className={`flex gap-0.5 rounded-full ${compact ? "h-1.5" : "h-3"} ${total === 0 ? "bg-slate-100" : ""}`}>
        {CATEGORIES.filter((category) => counts[category] > 0).map((category) => (
          <span
            key={category}
            title={`${CATEGORY_LABELS[category]}: ${formatNumber(counts[category])} জন`}
            style={{ width: `${(counts[category] / total) * 100}%` }}
            className={`origin-left animate-grow rounded-full ${CATEGORY_STYLES[category].dot}`}
          />
        ))}
      </div>
      {!compact && (
        <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm text-slate-600">
          {CATEGORIES.map((category) => (
            <span key={category} className="flex items-center gap-1.5">
              <span className={`size-2.5 rounded-full ${CATEGORY_STYLES[category].dot}`} />
              {CATEGORY_LABELS[category]}
              <span className="font-semibold text-slate-900">{formatNumber(counts[category])} জন</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
