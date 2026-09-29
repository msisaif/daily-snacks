"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";

export type NavLink = { href: string; label: string; icon: IconName };

// display (flex/grid/hidden) ক্লাস বাইরে থেকে className-এ আসে
const VARIANTS = {
  header: {
    nav: "no-scrollbar gap-1 overflow-x-auto",
    link: "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition duration-200",
    active: "bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/25",
    inactive: "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm",
  },
  sub: {
    nav: "no-scrollbar gap-1 overflow-x-auto rounded-2xl border border-slate-200/70 bg-slate-100/80 p-1",
    link: "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition duration-200",
    active: "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/70",
    inactive: "text-slate-600 hover:bg-white/60 hover:text-slate-900",
  },
  bottom: {
    nav: "auto-cols-fr grid-flow-col",
    link: "group flex min-w-0 flex-col items-center gap-1 px-1 pt-2 pb-2.5 text-[11px] font-medium transition",
    active: "text-emerald-700",
    inactive: "text-slate-500",
  },
};

export function NavLinks({
  links,
  variant,
  className = "",
}: {
  links: NavLink[];
  variant: keyof typeof VARIANTS;
  className?: string;
}) {
  const pathname = usePathname();
  const styles = VARIANTS[variant];

  return (
    <nav className={`${styles.nav} ${className}`}>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`${styles.link} ${isActive ? styles.active : styles.inactive}`}
          >
            {variant === "bottom" ? (
              <>
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition duration-200 ${
                    isActive ? "bg-emerald-100 text-emerald-700" : "group-hover:bg-slate-100"
                  }`}
                >
                  <Icon name={link.icon} className="size-5" />
                </span>
                <span className="max-w-full truncate">{link.label}</span>
              </>
            ) : (
              <>
                <Icon name={link.icon} className="size-4" />
                {link.label}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
