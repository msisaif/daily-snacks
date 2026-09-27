"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "আজকের মেনু" },
  { href: "/summary", label: "সারাংশ" },
  { href: "/history", label: "ইতিহাস" },
  { href: "/account", label: "অ্যাকাউন্ট" },
];

const ADMIN_LINK = { href: "/admin", label: "অ্যাডমিন" };

export function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const links = isAdmin ? [...LINKS, ADMIN_LINK] : LINKS;

  return (
    <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2 pb-2 text-sm">
      {links.map((link) => {
        const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-full px-3 py-1.5 ${
              isActive
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
