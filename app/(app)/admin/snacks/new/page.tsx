import type { Metadata } from "next";
import { cardClass, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatTaka } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { createSnack } from "../actions";
import { SnackForm } from "../snack-form";

export const metadata: Metadata = { title: "নতুন আইটেম" };

export default async function NewSnackPage() {
  await requireAdmin();
  const { budgetPerPerson } = await getSettings();

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="নতুন আইটেম"
        description={`দাম জনপ্রতি বাজেটের (${formatTaka(budgetPerPerson)}) বেশি হতে পারবে না।`}
        icon="cookie"
        tone="orange"
        backHref="/admin/snacks"
      />
      <section className={cardClass}>
        <SnackForm action={createSnack} budget={budgetPerPerson} submitLabel="আইটেম যোগ করুন" />
      </section>
    </div>
  );
}
