import type { Metadata } from "next";
import Link from "next/link";
import { linkButtonClass, MenuStatusBadge, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { listMenus } from "@/lib/menu";

export const metadata: Metadata = { title: "মেনু" };

export default async function MenusPage() {
  await requireAdmin();
  const menus = await listMenus();

  return (
    <div>
      <PageHeader
        title="মেনু"
        action={
          <Link href="/admin/menus/new" className={linkButtonClass}>
            + নতুন মেনু
          </Link>
        }
      />

      {menus.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          এখনো কোনো মেনু নেই। প্রথম মেনুটা বানান।
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {menus.map((menu) => (
            <li key={menu.id}>
              <Link
                href={`/admin/menus/${menu.id}`}
                className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="font-medium">{formatDate(menu.menuDate)}</p>
                  <p className="truncate text-sm text-slate-500">
                    {menu.itemNames || "কোনো আইটেম নেই"}
                  </p>
                  {menu.status === "open" && menu.cutoffAt && (
                    <p className="text-xs text-slate-500">কাটঅফ: {formatDateTime(menu.cutoffAt)}</p>
                  )}
                </div>
                <MenuStatusBadge status={menu.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
