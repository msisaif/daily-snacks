import type { Metadata } from "next";
import Link from "next/link";
import { cardClass, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { listSnacksForMenuForm } from "@/lib/menu";
import { getSettings } from "@/lib/settings";
import { todayInDhaka } from "@/lib/time";
import { saveMenuDraft } from "../actions";
import { MenuForm } from "../menu-forms";

export const metadata: Metadata = { title: "নতুন মেনু" };

export default async function NewMenuPage() {
  await requireAdmin();
  const snacks = await listSnacksForMenuForm(null);
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="নতুন মেনু (খসড়া)" backHref="/admin/menus" />
      {snacks.length < 2 ? (
        <p className={`${cardClass} text-slate-600`}>
          মেনু বানাতে অন্তত ২টা সক্রিয় আইটেম লাগবে।{" "}
          <Link href="/admin/snacks/new" className="text-emerald-700 underline">
            আইটেম যোগ করুন
          </Link>
        </p>
      ) : (
        <section className={cardClass}>
          <MenuForm
            action={saveMenuDraft.bind(null, null)}
            snacks={snacks}
            minDate={todayInDhaka()}
            defaultCutoffTime={settings.defaultCutoffTime}
            submitLabel="খসড়া সেভ করুন"
          />
        </section>
      )}
    </div>
  );
}
