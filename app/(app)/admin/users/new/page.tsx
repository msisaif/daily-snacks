import type { Metadata } from "next";
import { cardClass, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { createUser } from "../actions";
import { CreateUserForm } from "../user-forms";

export const metadata: Metadata = { title: "নতুন ইউজার" };

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="নতুন ইউজার"
        description="সাইনআপ পেজ নেই; অ্যাকাউন্ট এখান থেকেই খোলা হয়।"
        icon="user-plus"
        tone="sky"
        backHref="/admin/users"
      />
      <section className={cardClass}>
        <CreateUserForm action={createUser} />
      </section>
    </div>
  );
}
