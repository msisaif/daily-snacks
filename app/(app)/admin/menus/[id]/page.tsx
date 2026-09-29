import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/action-button";
import { Icon, type IconName } from "@/components/icons";
import {
  Avatar,
  buttonClass,
  Callout,
  cardClass,
  CardTitle,
  CategoryBadge,
  CategoryIcon,
  CATEGORY_STYLES,
  DefaultBadge,
  MenuStatusBadge,
  PageHeader,
} from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { MENU_STATUSES, MENU_STATUS_LABELS, type MenuStatus } from "@/lib/constants";
import { formatDate, formatDateTime, formatNumber, formatTaka } from "@/lib/format";
import { getDb } from "@/lib/db";
import {
  countSelections,
  getMenu,
  getMenuOptions,
  getPeopleChoices,
  listSnacksForMenuForm,
  type MenuOption,
  type PersonChoice,
} from "@/lib/menu";
import { getSettings } from "@/lib/settings";
import { isoToDhakaInput, todayInDhaka } from "@/lib/time";
import { parseId } from "@/lib/validation";
import {
  addGuestAction,
  assignForUserAction,
  backToDraftAction,
  closeMenuAction,
  deleteMenuAction,
  markDeliveredAction,
  openMenuAction,
  removeGuestAction,
  reopenMenuAction,
  saveMenuDraft,
} from "../actions";
import { AssignForm, GuestForm, MenuForm, ReopenForm } from "../menu-forms";

export const metadata: Metadata = { title: "মেনু" };

export default async function MenuDetailPage({ params }: PageProps<"/admin/menus/[id]">) {
  await requireAdmin();
  const menuId = parseId((await params).id);
  if (!menuId) notFound();

  const menu = await getMenu(menuId);
  if (!menu) notFound();

  const options = await getMenuOptions(menuId);
  const selectionCount = await countSelections(menuId);
  const people = await getPeopleChoices(menu);
  const guests = people.filter(
    (person): person is PersonChoice & { guestId: number } => person.guestId !== null,
  );
  const canAssign = menu.status === "open" || menu.status === "closed";

  const info: { icon: IconName; label: string; value: string }[] = [];
  if (menu.cutoffAt) info.push({ icon: "clock", label: "কাটঅফ", value: formatDateTime(menu.cutoffAt) });
  if (menu.closedAt) info.push({ icon: "lock", label: "বন্ধ হয়েছে", value: formatDateTime(menu.closedAt) });
  if (menu.deliveredAt) info.push({ icon: "truck", label: "ডেলিভারি", value: formatDateTime(menu.deliveredAt) });
  if (menu.status === "open") {
    info.push({ icon: "users", label: "এখন পর্যন্ত নিজে বেছেছে", value: `${formatNumber(selectionCount)} জন` });
  }
  if (menu.status === "closed" || menu.status === "delivered") {
    info.push({ icon: "users", label: "মোট", value: `${formatNumber(selectionCount)} জন (ডিফল্টসহ)` });
  }
  if (guests.length > 0) info.push({ icon: "user-plus", label: "গেস্ট", value: `${formatNumber(guests.length)} জন` });

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title={formatDate(menu.menuDate)}
        icon="clipboard"
        badge={<MenuStatusBadge status={menu.status} />}
        backHref="/admin/menus"
        action={
          menu.status !== "draft" && (
            <Link href={`/history/${menuId}`} className={buttonClass.secondary}>
              <Icon name="chart-pie" className="size-4" />
              সারাংশ দেখুন (কে কী পাচ্ছে)
            </Link>
          )
        }
      />

      <section className={cardClass}>
        <StatusSteps status={menu.status} />
        {info.length > 0 && (
          <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {info.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Icon name={item.icon} className="size-4" />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs text-slate-500">{item.label}</dt>
                  <dd className="font-semibold text-slate-900">{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}
        {menu.note && (
          <div className="mt-5">
            <Callout tone="amber" icon="note">
              নোট: {menu.note}
            </Callout>
          </div>
        )}
      </section>

      {menu.status === "draft" ? (
        <DraftSection menuId={menuId} menu={menu} options={options} />
      ) : (
        <div className={`grid items-start gap-6 ${canAssign ? "lg:grid-cols-2" : ""}`}>
          <div className="space-y-6">
            <section className={cardClass}>
              <CardTitle
                title="আইটেম"
                description={`${formatNumber(options.length)}টি আইটেম`}
                icon="cookie"
                tone="orange"
              />
              <ul className="space-y-2.5">
                {options.map((option) => {
                  const styles = CATEGORY_STYLES[option.category];
                  return (
                    <li
                      key={option.snackItemId}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-3"
                    >
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${
                          styles.placeholders[option.snackItemId % styles.placeholders.length]
                        }`}
                      >
                        <CategoryIcon category={option.category} className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-slate-900">{option.name}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5">
                          <CategoryBadge category={option.category} />
                          {option.isDefault && <DefaultBadge />}
                        </span>
                      </span>
                      <span className="shrink-0 font-bold text-slate-900">{formatTaka(option.price)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>

            {menu.status === "open" && (
              <section className={cardClass}>
                <CardTitle
                  title="মেনু খোলা আছে"
                  description="কাটঅফের আগেই বন্ধ করলে যারা বাছেনি তারা ডিফল্ট পাবে।"
                  icon="clock"
                  tone="emerald"
                />
                <div className="flex flex-wrap gap-3">
                  <ActionButton
                    action={closeMenuAction.bind(null, menuId)}
                    variant="danger"
                    icon="lock"
                    confirmMessage="কাটঅফের আগেই মেনু বন্ধ করবেন? যারা বাছেনি তারা ডিফল্ট পাবে।"
                  >
                    এখনই বন্ধ করুন
                  </ActionButton>
                  {selectionCount === 0 && guests.length === 0 && (
                    <ActionButton action={backToDraftAction.bind(null, menuId)} icon="undo">
                      খসড়ায় ফেরান (আইটেম বদলাতে)
                    </ActionButton>
                  )}
                </div>
              </section>
            )}

            {menu.status === "closed" && (
              <>
                <section className={cardClass}>
                  <CardTitle title="অর্ডার দেওয়া আর নাস্তা আসার পর" icon="truck" tone="sky" />
                  <ActionButton action={markDeliveredAction.bind(null, menuId)} variant="primary" icon="check">
                    ডেলিভারি হয়েছে
                  </ActionButton>
                </section>
                <section className={cardClass}>
                  <CardTitle
                    title="আবার খুলুন"
                    description="নতুন কাটঅফ লাগবে। বন্ধের সময় অটো-বসানো ডিফল্টগুলো মুছে যাবে; যারা নিজে বেছেছিল তাদের বাছাই থাকবে।"
                    icon="undo"
                    tone="amber"
                  />
                  <ReopenForm action={reopenMenuAction.bind(null, menuId)} />
                </section>
              </>
            )}
          </div>

          {canAssign && (
            <div className="space-y-6">
              <AssignSection menuId={menuId} options={options} people={people} />

              <section className={cardClass}>
                <CardTitle
                  title="গেস্ট"
                  description="অফিসের বাইরের কেউ এলে। নম্বর নিজে থেকে বসবে (গেস্ট ১, ২…), খরচ মোট হিসাবে যোগ হবে।"
                  icon="user-plus"
                  tone="rose"
                />
                {guests.length > 0 && (
                  <ul className="mb-5 divide-y divide-slate-100 rounded-2xl border border-slate-200/70">
                    {guests.map((guest) => (
                      <li key={guest.guestId} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
                        <span className="flex min-w-0 items-center gap-3">
                          <Avatar name={guest.name} className="size-8 text-xs" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-slate-900">{guest.name}</span>
                            <span className="block text-xs text-slate-500">
                              {itemName(options, guest.snackItemId)} · দিয়েছেন: {guest.assignedByName}
                            </span>
                          </span>
                        </span>
                        <ActionButton
                          action={removeGuestAction.bind(null, menuId, guest.guestId)}
                          variant="subtle"
                          icon="trash"
                          confirmMessage={`${guest.name} মুছে ফেলবেন?`}
                        >
                          মুছুন
                        </ActionButton>
                      </li>
                    ))}
                  </ul>
                )}
                <GuestForm action={addGuestAction.bind(null, menuId)} options={options} />
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusSteps({ status }: { status: MenuStatus }) {
  const current = MENU_STATUSES.indexOf(status);
  const lastIndex = MENU_STATUSES.length - 1;
  return (
    <ol className="flex items-center">
      {MENU_STATUSES.map((step, index) => (
        <li key={step} className={`flex items-center ${index < lastIndex ? "flex-1" : ""}`}>
          <span className="flex flex-col items-center gap-2 text-center">
            <span
              className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold ${
                index < current
                  ? "bg-emerald-500 text-white"
                  : index === current
                    ? "bg-linear-to-br from-emerald-400 to-teal-600 text-white shadow-md shadow-emerald-500/30 ring-4 ring-emerald-100"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {/* শেষ ধাপে (ডেলিভারি) পৌঁছালে সেটাও সম্পন্ন */}
              {index < current || (index === current && index === lastIndex) ? (
                <Icon name="check" className="size-4" />
              ) : (
                formatNumber(index + 1)
              )}
            </span>
            <span className={`text-xs font-medium ${index <= current ? "text-slate-800" : "text-slate-400"}`}>
              {MENU_STATUS_LABELS[step]}
            </span>
          </span>
          {index < lastIndex && (
            <span
              className={`mx-2 mb-6 h-0.5 flex-1 rounded-full ${index < current ? "bg-emerald-400" : "bg-slate-200"}`}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

function itemName(options: MenuOption[], snackItemId: number): string {
  return options.find((option) => option.snackItemId === snackItemId)?.name ?? "";
}

async function AssignSection({
  menuId,
  options,
  people,
}: {
  menuId: number;
  options: MenuOption[];
  people: PersonChoice[];
}) {
  const db = await getDb();
  const result = await db.execute(
    "SELECT id, name, employee_id FROM users WHERE is_active = 1 ORDER BY name COLLATE NOCASE",
  );
  const current = new Map(people.map((person) => [person.userId, person]));
  const users = result.rows.map((row) => {
    const id = Number(row.id);
    const choice = current.get(id);
    const now = choice
      ? ` · এখন: ${itemName(options, choice.snackItemId)}${choice.isDefault ? " (ডিফল্ট)" : ""}`
      : "";
    return { id, label: `${String(row.name)} (${String(row.employee_id)})${now}` };
  });

  return (
    <section className={cardClass}>
      <CardTitle
        title="কারো হয়ে বাছাই"
        description="কেউ সাইটে ঢুকতে না পারলে তার হয়ে আইটেম দিন। সারাংশে আপনার নাম দেখাবে। মেনু খোলা থাকলে সে নিজে পরে বদলাতে পারবে।"
        icon="users"
        tone="sky"
      />
      <AssignForm action={assignForUserAction.bind(null, menuId)} users={users} options={options} />
    </section>
  );
}

async function DraftSection({
  menuId,
  menu,
  options,
}: {
  menuId: number;
  menu: { menuDate: string; cutoffAt: string | null; note: string | null };
  options: { snackItemId: number; isDefault: boolean }[];
}) {
  const snacks = await listSnacksForMenuForm(menuId);
  const settings = await getSettings();

  return (
    <>
      <section className={cardClass}>
        <CardTitle title="খসড়া এডিট" icon="note" tone="emerald" />
        <MenuForm
          action={saveMenuDraft.bind(null, menuId)}
          snacks={snacks}
          minDate={todayInDhaka()}
          defaultCutoffTime={settings.defaultCutoffTime}
          submitLabel="খসড়া সেভ করুন"
          initial={{
            menuDate: menu.menuDate,
            cutoff: menu.cutoffAt ? isoToDhakaInput(menu.cutoffAt) : "",
            note: menu.note ?? "",
            snackIds: options.map((option) => option.snackItemId),
            defaultIds: options.filter((option) => option.isDefault).map((option) => option.snackItemId),
          }}
        />
      </section>

      <section className={cardClass}>
        <CardTitle
          title="প্রস্তুত?"
          description="খোলার সময় আইটেমের বর্তমান দাম আর গ্রুপ আবার যাচাই হয়ে মেনুতে সেভ হবে। খোলার পর আইটেম বদলানো যাবে না (যতক্ষণ কেউ বাছাই না করে, খসড়ায় ফেরানো যাবে)।"
          icon="send"
          tone="emerald"
        />
        <div className="flex flex-wrap gap-3">
          <ActionButton action={openMenuAction.bind(null, menuId)} variant="primary" icon="send">
            মেনু খুলুন
          </ActionButton>
          <ActionButton
            action={deleteMenuAction.bind(null, menuId)}
            variant="danger"
            icon="trash"
            confirmMessage="এই খসড়া মেনু মুছে ফেলবেন?"
          >
            খসড়া মুছুন
          </ActionButton>
        </div>
      </section>
    </>
  );
}
