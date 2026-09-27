import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cardClass, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import type { Category } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { parseId } from "@/lib/validation";
import { updateSnack } from "../actions";
import { SnackForm } from "../snack-form";

export const metadata: Metadata = { title: "আইটেম এডিট" };

export default async function EditSnackPage({ params }: PageProps<"/admin/snacks/[id]">) {
  await requireAdmin();
  const snackId = parseId((await params).id);
  if (!snackId) notFound();

  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT name, description, price, category, image_url, is_active FROM snack_items WHERE id = ?",
    args: [snackId],
  });
  const row = result.rows[0];
  if (!row) notFound();

  const { budgetPerPerson } = await getSettings();

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title={String(row.name)} backHref="/admin/snacks" />
      <section className={cardClass}>
        <SnackForm
          action={updateSnack.bind(null, snackId)}
          budget={budgetPerPerson}
          submitLabel="সেভ করুন"
          initial={{
            name: String(row.name),
            description: row.description ? String(row.description) : "",
            price: Number(row.price),
            category: row.category as Category,
            imageUrl: row.image_url ? String(row.image_url) : "",
            isActive: Number(row.is_active) === 1,
          }}
        />
      </section>
      <p className="mt-3 text-xs text-slate-500">
        দাম বা গ্রুপ বদলালে আগে খোলা মেনুতে প্রভাব পড়বে না, কারণ মেনু খোলার সময়ের দাম সেভ করা থাকে।
      </p>
    </div>
  );
}
