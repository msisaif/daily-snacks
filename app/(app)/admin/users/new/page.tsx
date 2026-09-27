import type { Metadata } from "next";
import { cardClass, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { createUser } from "../actions";
import { CreateUserForm } from "../user-forms";

export const metadata: Metadata = { title: "নতুন ইউজার" };

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="নতুন ইউজার" backHref="/admin/users" />
      <section className={cardClass}>
        <CreateUserForm action={createUser} />
      </section>
    </div>
  );
}
