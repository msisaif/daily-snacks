import Link from "next/link";
import { cardClass, CategoryIcon, linkButtonClass, MenuStatusBadge } from "@/components/ui";
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
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <p className="text-sm font-medium text-slate-500">{formatDate(menu.menuDate)}</p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {isToday ? "আজকের মেনু" : "আগামী মেনু"}
            </h1>
            <MenuStatusBadge status={menu.status} />
          </div>
        </div>
        {canChange && menu.cutoffAt && (
          <Countdown cutoffAt={menu.cutoffAt} cutoffLabel={formatDateTime(menu.cutoffAt)} />
        )}
      </div>

      {choice ? (
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-md">
          <CategoryIcon
            category={choice.option.category}
            className="pointer-events-none absolute -right-4 -bottom-6 size-32 opacity-15"
          />
          <p className="text-sm font-medium text-emerald-100">
            {menu.status === "delivered" ? "আপনি পেয়েছেন" : isToday ? "আজ আপনি পাবেন" : "এই দিন আপনি পাবেন"}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{choice.option.name}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-semibold">
              {formatTaka(choice.option.price)}
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5">
              {CATEGORY_LABELS[choice.option.category]}
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5">
              {choice.isDefault ? "ডিফল্ট" : "আপনার বাছাই"}
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-slate-600">
          এই মেনুতে আপনার জন্য কিছু বরাদ্দ নেই।
        </div>
      )}

      {menu.note && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-inset ring-amber-600/15">
          {menu.note}
        </p>
      )}

      <p className="text-sm text-slate-500">
        {canChange
          ? `কার্ডে ট্যাপ করে বাছাই করুন। কিছু না বাছলে আপনার ডিফল্ট গ্রুপের (${CATEGORY_LABELS[user.defaultCategory]}) ডিফল্ট আইটেম পাবেন।`
          : "মেনু বন্ধ হয়ে গেছে, এখন আর বদলানো যাবে না।"}
      </p>

      <MenuPicker
        action={updateChoice.bind(null, menu.id)}
        options={options}
        receivingId={choice?.option.snackItemId ?? null}
        hasOwnChoice={hasOwnChoice}
        canChange={canChange}
      />

      <Link
        href="/summary"
        className="block text-center text-sm font-medium text-emerald-700 hover:underline"
      >
        সবাই কী নিচ্ছে, সারাংশ দেখুন →
      </Link>
    </section>
  );
}
