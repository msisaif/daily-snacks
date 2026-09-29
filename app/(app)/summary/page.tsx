import type { Metadata } from "next";
import { MenuSummaryView } from "@/components/menu-summary";
import { EmptyState, MenuStatusBadge, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getHomeMenus, getMenuSummary } from "@/lib/menu";
import { todayInDhaka } from "@/lib/time";

export const metadata: Metadata = { title: "সারাংশ" };

export default async function SummaryPage() {
  await requireUser();
  const menus = await getHomeMenus();

  if (menus.length === 0) {
    return (
      <div className="stagger">
        <EmptyState icon="chart-pie" title="আজ কোনো মেনু নেই">
          আগের দিনগুলোর হিসাব &quot;ইতিহাস&quot; পেজে পাবেন।
        </EmptyState>
      </div>
    );
  }

  const today = todayInDhaka();
  const summaries = [];
  for (const menu of menus) {
    const data = await getMenuSummary(menu.id);
    if (data) summaries.push(data);
  }

  return (
    <div className="space-y-16">
      {summaries.map(({ menu, summary, people }) => (
        <section key={menu.id} className="stagger space-y-6">
          <PageHeader
            title={menu.menuDate === today ? "আজকের সারাংশ" : "আগামী মেনুর সারাংশ"}
            description={formatDate(menu.menuDate)}
            icon="chart-pie"
            tone="sky"
            badge={<MenuStatusBadge status={menu.status} />}
          />
          <MenuSummaryView status={menu.status} summary={summary} people={people} />
        </section>
      ))}
    </div>
  );
}
