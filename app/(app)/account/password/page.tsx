import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "পাসওয়ার্ড বদলান" };

// requireUser() নয়: must_change_password ইউজারকে এখানেই পাঠানো হয়
export default async function PasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-bold">পাসওয়ার্ড বদলান</h1>
      {user.mustChangePassword && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          অ্যাপ ব্যবহারের আগে অস্থায়ী পাসওয়ার্ডের বদলে নিজের একটা নতুন পাসওয়ার্ড সেট করুন।
        </p>
      )}
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <PasswordForm />
      </section>
    </div>
  );
}
