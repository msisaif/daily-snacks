import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { logout } from "@/app/login/actions";
import { Icon } from "@/components/icons";
import { NavLinks, type NavLink } from "@/components/nav-links";
import { Avatar, containerClass, LogoMark } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

const MAIN_LINKS: NavLink[] = [
  { href: "/", label: "আজকের মেনু", icon: "utensils" },
  { href: "/summary", label: "সারাংশ", icon: "chart-pie" },
  { href: "/history", label: "ইতিহাস", icon: "history" },
  { href: "/account", label: "অ্যাকাউন্ট", icon: "user" },
];

// Layout নেভিগেশনে ফিরে আসার সময় আবার রান হয় না, তাই প্রতিটা পেজ নিজেও requireUser() কল করে
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const links: NavLink[] =
    user.role === "admin"
      ? [...MAIN_LINKS, { href: "/admin", label: "অ্যাডমিন", icon: "shield" }]
      : MAIN_LINKS;
  const showNav = !user.mustChangePassword;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/75 backdrop-blur-xl">
        {/* বড় স্ক্রিনে নেভিগেশন এক লাইনে, ট্যাবলেটে দ্বিতীয় লাইনে, মোবাইলে নিচের বারে */}
        <div className={`${containerClass} flex flex-wrap items-center gap-x-6`}>
          <Link href="/" className="group flex h-16 items-center gap-3">
            <LogoMark className="size-10 transition duration-300 group-hover:-rotate-6" />
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold tracking-tight text-slate-900">
                ডেইলি স্ন্যাকস
              </span>
              <span className="block text-xs font-medium text-slate-500">Medigene IT</span>
            </span>
          </Link>
          {showNav && (
            <NavLinks
              links={links}
              variant="header"
              className="order-last -mx-1 hidden w-full px-1 pb-3 sm:flex lg:order-0 lg:w-auto lg:pb-0"
            />
          )}
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/account"
              title={user.name}
              className="flex items-center gap-2.5 rounded-full p-1 transition hover:bg-white hover:shadow-sm sm:pr-3 lg:pr-1"
            >
              <Avatar name={user.name} />
              {/* বড় স্ক্রিনে নেভিগেশন এই লাইনেই, তাই সেখানে শুধু ছবি (নাম title-এ) */}
              <span className="hidden max-w-40 truncate text-sm font-medium text-slate-700 sm:block lg:hidden">
                {user.name}
              </span>
            </Link>
            <form action={logout}>
              <button
                type="submit"
                title="লগআউট"
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <Icon name="logout" className="size-4.5" />
                <span className="sr-only sm:not-sr-only">লগআউট</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className={`${containerClass} pt-6 pb-28 sm:pt-8 sm:pb-16`}>{children}</main>

      {showNav && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/70 bg-white/85 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-16px_rgb(15_23_42/0.2)] backdrop-blur-xl sm:hidden">
          <NavLinks links={links} variant="bottom" className="grid" />
        </div>
      )}
    </div>
  );
}
