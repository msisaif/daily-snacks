import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import {
  buttonClass,
  DateTile,
  EmptyState,
  listClass,
  listRowClass,
  MenuStatusBadge,
  PageHeader,
} from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { listMenus } from "@/lib/menu";

export const metadata: Metadata = { title: "মেনু" };

export default async function MenusPage() {
  await requireAdmin();
  const menus = await listMenus();

  const newMenuButton = (
    <Link href="/admin/menus/new" className={buttonClass.primary}>
      <Icon name="plus" className="size-4" />
      নতুন মেনু
    </Link>
  );

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="মেনু"
        description="খসড়া বানান, খুলুন, আর নাস্তা এলে ডেলিভারি চিহ্নিত করুন।"
        icon="clipboard"
        action={newMenuButton}
      />

      {menus.length === 0 ? (
        <EmptyState icon="clipboard" title="এখনো কোনো মেনু নেই" action={newMenuButton}>
          প্রথম মেনুটা বানান।
        </EmptyState>
      ) : (
        <ul className={listClass}>
          {menus.map((menu) => (
            <li key={menu.id}>
              <Link href={`/admin/menus/${menu.id}`} className={listRowClass}>
                <DateTile date={menu.menuDate} status={menu.status} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{formatDate(menu.menuDate)}</p>
                  <p className="truncate text-sm text-slate-500">{menu.itemNames || "কোনো আইটেম নেই"}</p>
                  {menu.status === "open" && menu.cutoffAt && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <Icon name="clock" className="size-3.5" />
                      কাটঅফ: {formatDateTime(menu.cutoffAt)}
                    </p>
                  )}
                </div>
                <MenuStatusBadge status={menu.status} />
                <Icon
                  name="chevron-right"
                  className="hidden size-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500 sm:block"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
