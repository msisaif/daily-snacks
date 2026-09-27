import type { Metadata } from "next";
import { MenuSummaryView } from "@/components/menu-summary";
import { cardClass, MenuStatusBadge } from "@/components/ui";
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
      <div className={`${cardClass} py-10 text-center`}>
        <p className="text-lg font-semibold">আজ কোনো মেনু নেই</p>
        <p className="mt-1 text-slate-600">আগের দিনগুলোর হিসাব &quot;ইতিহাস&quot; পেজে পাবেন।</p>
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
    <div className="space-y-10">
      {summaries.map(({ menu, summary, people }) => (
        <section key={menu.id} className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">
                {menu.menuDate === today ? "আজকের সারাংশ" : "আগামী মেনুর সারাংশ"}
              </h1>
              <MenuStatusBadge status={menu.status} />
            </div>
            <p className="text-sm text-slate-600">{formatDate(menu.menuDate)}</p>
          </div>
          <MenuSummaryView status={menu.status} summary={summary} people={people} />
        </section>
      ))}
    </div>
  );
}
