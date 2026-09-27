import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "অ্যাকাউন্ট" };

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-xl font-bold">আমার অ্যাকাউন্ট</h1>

      <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
        <div>
          <dt className="text-slate-500">Employee ID</dt>
          <dd className="font-medium">{user.employeeId}</dd>
        </div>
        <div>
          <dt className="text-slate-500">রোল</dt>
          <dd className="font-medium">{ROLE_LABELS[user.role]}</dd>
        </div>
      </dl>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <ProfileForm name={user.name} defaultCategory={user.defaultCategory} />
      </section>

      <Link
        href="/account/password"
        className="block rounded-2xl border border-slate-200 bg-white p-4 text-center font-medium text-emerald-700 hover:bg-slate-50"
      >
        পাসওয়ার্ড বদলান
      </Link>
    </div>
  );
}
