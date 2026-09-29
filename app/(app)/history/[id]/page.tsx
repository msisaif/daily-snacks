import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuSummaryView } from "@/components/menu-summary";
import { Callout, MenuStatusBadge, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getMenuSummary } from "@/lib/menu";
import { parseId } from "@/lib/validation";

export const metadata: Metadata = { title: "মেনুর সারাংশ" };

export default async function HistoryDetailPage({ params }: PageProps<"/history/[id]">) {
  await requireUser();
  const menuId = parseId((await params).id);
  if (!menuId) notFound();

  const data = await getMenuSummary(menuId);
  // খসড়া মেনু শুধু অ্যাডমিন প্যানেলে দেখা যায়
  if (!data || data.menu.status === "draft") notFound();
  const { menu, summary, people } = data;

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title={formatDate(menu.menuDate)}
        description="এই দিনের নাস্তার হিসাব"
        icon="calendar"
        tone="amber"
        badge={<MenuStatusBadge status={menu.status} />}
        backHref="/history"
      />
      {menu.note && (
        <Callout tone="amber" icon="note">
          নোট: {menu.note}
        </Callout>
      )}
      <MenuSummaryView status={menu.status} summary={summary} people={people} />
    </div>
  );
}
