import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { buttonClass, cardClass, EmptyState, MenuStatusBadge, PageHeader } from "@/components/ui";
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
    <div className="stagger space-y-6">
      <PageHeader
        title="নতুন মেনু"
        description="আগে খসড়া হিসেবে সেভ হবে, তারপর মেনু খুলবেন।"
        icon="clipboard"
        badge={<MenuStatusBadge status="draft" />}
        backHref="/admin/menus"
      />
      {snacks.length < 2 ? (
        <EmptyState
          icon="cookie"
          title="মেনু বানাতে অন্তত ২টা সক্রিয় আইটেম লাগবে"
          action={
            <Link href="/admin/snacks/new" className={buttonClass.primary}>
              <Icon name="plus" className="size-4" />
              আইটেম যোগ করুন
            </Link>
          }
        />
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
