import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Callout, cardClass, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "পাসওয়ার্ড বদলান" };

// requireUser() নয়: must_change_password ইউজারকে এখানেই পাঠানো হয়
export default async function PasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="পাসওয়ার্ড বদলান"
        description="বদলানোর পর অন্য সব ডিভাইস থেকে লগআউট হয়ে যাবে।"
        icon="lock"
        tone="violet"
        backHref={user.mustChangePassword ? undefined : "/account"}
      />
      {user.mustChangePassword && (
        <Callout tone="amber" icon="alert">
          অ্যাপ ব্যবহারের আগে অস্থায়ী পাসওয়ার্ডের বদলে নিজের একটা নতুন পাসওয়ার্ড সেট করুন।
        </Callout>
      )}
      <section className={cardClass}>
        <PasswordForm />
      </section>
    </div>
  );
}
