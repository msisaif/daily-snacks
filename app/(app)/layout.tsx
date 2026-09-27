import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { logout } from "@/app/login/actions";
import { getCurrentUser } from "@/lib/auth";
import { NavLinks } from "./nav-links";

// Layout নেভিগেশনে ফিরে আসার সময় আবার রান হয় না, তাই প্রতিটা পেজ নিজেও requireUser() কল করে
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-lg font-bold text-emerald-700">
            ডেইলি স্ন্যাকস
          </Link>
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="truncate text-slate-600">{user.name}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
              >
                লগআউট
              </button>
            </form>
          </div>
        </div>
        {!user.mustChangePassword && <NavLinks isAdmin={user.role === "admin"} />}
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
