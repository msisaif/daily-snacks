import type { Metadata } from "next";
import { cardClass, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "সেটিংস" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="সেটিংস"
        description="জনপ্রতি বাজেট আর নতুন মেনুর ডিফল্ট কাটঅফ।"
        icon="sliders"
        tone="violet"
      />
      <section className={cardClass}>
        <SettingsForm
          budgetPerPerson={settings.budgetPerPerson}
          defaultCutoffTime={settings.defaultCutoffTime}
        />
      </section>
    </div>
  );
}
