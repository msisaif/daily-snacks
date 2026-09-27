import type { Metadata } from "next";
import { cardClass, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { createSnack } from "../actions";
import { SnackForm } from "../snack-form";

export const metadata: Metadata = { title: "নতুন আইটেম" };

export default async function NewSnackPage() {
  await requireAdmin();
  const { budgetPerPerson } = await getSettings();

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="নতুন আইটেম" backHref="/admin/snacks" />
      <section className={cardClass}>
        <SnackForm action={createSnack} budget={budgetPerPerson} submitLabel="আইটেম যোগ করুন" />
      </section>
    </div>
  );
}
