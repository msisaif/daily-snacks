import type { ReactNode } from "react";
import { NavLinks, type NavLink } from "@/components/nav-links";
import { requireAdmin } from "@/lib/auth";

const ADMIN_LINKS: NavLink[] = [
  { href: "/admin/menus", label: "মেনু", icon: "clipboard" },
  { href: "/admin/users", label: "ইউজার", icon: "users" },
  { href: "/admin/snacks", label: "নাস্তা", icon: "cookie" },
  { href: "/admin/settings", label: "সেটিংস", icon: "sliders" },
  { href: "/admin/reports", label: "রিপোর্ট", icon: "chart-bar" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <NavLinks links={ADMIN_LINKS} variant="sub" className="flex w-fit max-w-full" />
      {children}
    </div>
  );
}
