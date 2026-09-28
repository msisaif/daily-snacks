import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { logout } from "@/app/login/actions";
import { NavLinks, type NavLink } from "@/components/nav-links";
import { LogoMark } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

const MAIN_LINKS: NavLink[] = [
  { href: "/", label: "আজকের মেনু" },
  { href: "/summary", label: "সারাংশ" },
  { href: "/history", label: "ইতিহাস" },
  { href: "/account", label: "অ্যাকাউন্ট" },
];

// Layout নেভিগেশনে ফিরে আসার সময় আবার রান হয় না, তাই প্রতিটা পেজ নিজেও requireUser() কল করে
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const links =
    user.role === "admin" ? [...MAIN_LINKS, { href: "/admin", label: "অ্যাডমিন" }] : MAIN_LINKS;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 pt-3 pb-2">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <LogoMark />
            <span className="leading-tight">
              <span className="block font-bold tracking-tight text-slate-900">ডেইলি স্ন্যাকস</span>
              <span className="block text-xs text-slate-500">Medigene IT</span>
            </span>
          </Link>
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="hidden truncate text-slate-600 sm:block">{user.name}</span>
            <span
              title={user.name}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-semibold text-emerald-700 ring-1 ring-emerald-600/20"
            >
              {Array.from(user.name)[0]}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                লগআউট
              </button>
            </form>
          </div>
        </div>
        {!user.mustChangePassword && (
          <NavLinks links={links} variant="tabs" className="mx-auto max-w-3xl px-2" />
        )}
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
