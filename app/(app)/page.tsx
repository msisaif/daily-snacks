import Link from "next/link";
import { Icon } from "@/components/icons";
import { buttonClass, Callout, CategoryIcon, EmptyState, MenuStatusBadge } from "@/components/ui";
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
      <div className="stagger">
        <EmptyState
          icon="utensils"
          title="আজ এখনো কোনো মেনু খোলা হয়নি"
          action={
            user.role === "admin" && (
              <Link href="/admin/menus" className={buttonClass.primary}>
                <Icon name="plus" className="size-4" />
                মেনু বানান
              </Link>
            )
          }
        >
          অ্যাডমিন মেনু খুললে এখানে দেখতে পাবেন।
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-16">
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
    <section className="stagger space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{formatDate(menu.menuDate)}</p>
          <div className="mt-0.5 flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
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
        <div
          className={`relative isolate overflow-hidden rounded-3xl bg-linear-to-br p-6 text-white shadow-xl sm:p-8 ${
            choice.option.category === "healthy"
              ? "from-emerald-600 to-teal-700 shadow-emerald-700/20"
              : "from-orange-600 to-rose-600 shadow-orange-700/20"
          }`}
        >
          <span className="absolute -top-20 -right-12 -z-10 size-60 rounded-full bg-white/10" />
          <span className="absolute -bottom-24 left-1/3 -z-10 size-48 rounded-full bg-white/10" />
          <CategoryIcon
            category={choice.option.category}
            className="pointer-events-none absolute right-6 bottom-5 -z-10 size-28 rotate-12 opacity-20 sm:right-10 sm:size-36"
          />
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-6 animate-pop items-center justify-center rounded-full bg-white/25">
              <Icon name="check" className="size-3.5" />
            </span>
            {menu.status === "delivered" ? "আপনি পেয়েছেন" : isToday ? "আজ আপনি পাবেন" : "এই দিন আপনি পাবেন"}
          </p>
          <p className="mt-3 font-display text-3xl leading-tight font-bold sm:text-4xl">{choice.option.name}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-white/20 px-3 py-1 font-semibold">
              {formatTaka(choice.option.price)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
              <CategoryIcon category={choice.option.category} className="size-3.5" />
              {CATEGORY_LABELS[choice.option.category]}
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1">
              {choice.isDefault
                ? "ডিফল্ট"
                : selection?.assignedByName
                  ? `${selection.assignedByName} দিয়েছেন`
                  : "আপনার বাছাই"}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-white/70 p-6 text-slate-600">
          <Icon name="info" className="size-5 shrink-0 text-slate-400" />
          এই মেনুতে আপনার জন্য কিছু বরাদ্দ নেই।
        </div>
      )}

      {menu.note && (
        <Callout tone="amber" icon="note">
          {menu.note}
        </Callout>
      )}

      <p className="flex items-start gap-2 text-sm text-slate-500">
        <Icon name={canChange ? "info" : "lock"} className="mt-0.5 size-4 shrink-0" />
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
        className="group mx-auto flex w-fit items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-600/15 transition hover:-translate-y-0.5 hover:shadow-md"
      >
        সবাই কী নিচ্ছে, সারাংশ দেখুন
        <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
