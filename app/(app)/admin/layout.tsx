import type { ReactNode } from "react";
import { NavLinks, type NavLink } from "@/components/nav-links";
import { requireAdmin } from "@/lib/auth";

const ADMIN_LINKS: NavLink[] = [
  { href: "/admin/menus", label: "মেনু" },
  { href: "/admin/users", label: "ইউজার" },
  { href: "/admin/snacks", label: "নাস্তা" },
  { href: "/admin/settings", label: "সেটিংস" },
  { href: "/admin/reports", label: "রিপোর্ট" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="space-y-5">
      <NavLinks links={ADMIN_LINKS} />
      {children}
    </div>
  );
}
