"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavLink = { href: string; label: string };

const VARIANTS = {
  tabs: {
    nav: "-mb-px flex gap-1 overflow-x-auto",
    link: "shrink-0 border-b-2 px-3 py-2.5 font-medium",
    active: "border-emerald-600 text-emerald-700",
    inactive: "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800",
  },
  pills: {
    nav: "flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm",
    link: "shrink-0 rounded-lg px-3 py-1.5 font-medium",
    active: "bg-emerald-600 text-white shadow-sm",
    inactive: "text-slate-600 hover:bg-slate-100",
  },
};

export function NavLinks({
  links,
  variant = "pills",
  className = "",
}: {
  links: NavLink[];
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const pathname = usePathname();
  const styles = VARIANTS[variant];

  return (
    <nav className={`text-sm ${styles.nav} ${className}`}>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`${styles.link} ${isActive ? styles.active : styles.inactive}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
