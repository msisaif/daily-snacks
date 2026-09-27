import Link from "next/link";
import { cardClass, linkButtonClass, MenuStatusBadge } from "@/components/ui";
import { requireUser, type CurrentUser } from "@/lib/auth";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime, formatTaka } from "@/lib/format";
import {
  effectiveChoice,
  getHomeMenus,
  getMenuOptions,
  getUserSelection,
  type Menu,
} from "@/lib/menu";
import { todayInDhaka } from "@/lib/time";
import { updateChoice } from "./actions";
import { Countdown } from "./countdown";
import { MenuPicker } from "./menu-picker";

export default async function HomePage() {
  const user = await requireUser();
  const menus = await getHomeMenus();

  if (menus.length === 0) {
    return (
      <div className={`${cardClass} space-y-3 py-10 text-center`}>
        <p className="text-lg font-semibold">আজ এখনো কোনো মেনু খোলা হয়নি</p>
        <p className="text-slate-600">অ্যাডমিন মেনু খুললে এখানে দেখতে পাবেন।</p>
        {user.role === "admin" && (
          <Link href="/admin/menus" className={linkButtonClass}>
            মেনু বানান
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {menus.map((menu) => (
        <MenuSection key={menu.id} menu={menu} user={user} />
      ))}
    </div>
  );
}

async function MenuSection({ menu, user }: { menu: Menu; user: CurrentUser }) {
  const options = await getMenuOptions(menu.id);
  const selection = await getUserSelection(menu.id, user.id);
  const choice = effectiveChoice(menu.status, selection, options, user.defaultCategory);

  const isToday = menu.menuDate === todayInDhaka();
  const canChange = menu.status === "open";
  const hasOwnChoice = selection !== null && !selection.isDefault;

  return (
    <section className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{isToday ? "আজকের মেনু" : "আগামী মেনু"}</h1>
          <MenuStatusBadge status={menu.status} />
        </div>
        <p className="text-sm text-slate-600">{formatDate(menu.menuDate)}</p>
      </div>

      <div
        className={`rounded-2xl p-4 ${choice ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}
      >
        {choice ? (
          <>
            <p className="text-sm opacity-90">
              {menu.status === "delivered" ? "আপনি পেয়েছেন" : isToday ? "আজ আপনি পাবেন" : "এই দিন আপনি পাবেন"}
            </p>
            <p className="text-2xl font-bold">
              {choice.option.name}{" "}
              <span className="text-base font-normal opacity-90">
                ({choice.isDefault ? "ডিফল্ট" : "আপনার বাছাই"})
              </span>
            </p>
            <p className="text-sm opacity-90">
              {formatTaka(choice.option.price)} · {CATEGORY_LABELS[choice.option.category]}
            </p>
          </>
        ) : (
          <p>এই মেনুতে আপনার জন্য কিছু বরাদ্দ নেই।</p>
        )}
      </div>

      {canChange && menu.cutoffAt ? (
        <div className="space-y-1">
          <Countdown cutoffAt={menu.cutoffAt} cutoffLabel={formatDateTime(menu.cutoffAt)} />
          <p className="text-sm text-slate-500">
            কার্ডে ট্যাপ করে বাছাই করুন। কিছু না বাছলে আপনার ডিফল্ট গ্রুপের (
            {CATEGORY_LABELS[user.defaultCategory]}) ডিফল্ট আইটেম পাবেন।
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-600">
          মেনু বন্ধ হয়ে গেছে, এখন আর বদলানো যাবে না।
        </p>
      )}

      {menu.note && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{menu.note}</p>
      )}

      <MenuPicker
        action={updateChoice.bind(null, menu.id)}
        options={options}
        receivingId={choice?.option.snackItemId ?? null}
        hasOwnChoice={hasOwnChoice}
        canChange={canChange}
      />
    </section>
  );
}
