import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ActionButton } from "@/components/action-button";
import { Icon } from "@/components/icons";
import { Tabs } from "@/components/tabs";
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
import { formatDate, formatNumber, formatTaka } from "@/lib/format";
import { getDb } from "@/lib/db";
import {
  countSelections,
  getMenu,
  getMenuOptions,
  getPeopleChoices,
  listLeaves,
  listSnacksForMenuForm,
  listSnacksToAdd,
  type Leave,
  type MenuOption,
  type PersonChoice,
} from "@/lib/menu";
import { getSettings } from "@/lib/settings";
import { isoToDhakaInput, todayInDhaka } from "@/lib/time";
import { parseId } from "@/lib/validation";
import {
  addGuestAction,
  addMenuItemAction,
  backToDraftAction,
  closeMenuAction,
  deleteMenuAction,
  markDeliveredAction,
  openMenuAction,
  removeGuestAction,
  removeMenuItemAction,
  reopenMenuAction,
  replaceMenuItemAction,
  saveMenuDraft,
  setAssignmentAction,
  setLeaveAction,
} from "../actions";
import {
  AddMenuItemCard,
  AssignList,
  GuestForm,
  LeaveList,
  MenuForm,
  MenuItemActions,
  ReopenForm,
  type EmployeeRow,
} from "../menu-forms";

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
  const leaves = menu.status === "draft" ? [] : await listLeaves(menu.menuDate);
  const employees = canAssign ? await listEmployees(options, people, leaves) : [];

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title={formatDate(menu.menuDate)}
        icon="clipboard"
        badge={<MenuStatusBadge status={menu.status} />}
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
        {menu.note && (
          <div className="mt-5">
            <Callout tone="amber" icon="note">
              নোট: {menu.note}
            </Callout>
          </div>
        )}

        {menu.status === "open" && (
          <ActionBar
            hint="কাটঅফের আগেই বন্ধ করলে যারা বাছেনি তারা ডিফল্ট পাবে।"
            actions={
              <>
                {selectionCount === 0 && guests.length === 0 && (
                  <ActionButton action={backToDraftAction.bind(null, menuId)} icon="undo">
                    খসড়ায় ফেরান (আইটেম বদলাতে)
                  </ActionButton>
                )}
                <ActionButton
                  action={closeMenuAction.bind(null, menuId)}
                  variant="danger"
                  icon="lock"
                  confirmMessage="কাটঅফের আগেই মেনু বন্ধ করবেন? যারা বাছেনি তারা ডিফল্ট পাবে।"
                >
                  এখনই বন্ধ করুন
                </ActionButton>
              </>
            }
          />
        )}

        {menu.status === "closed" && (
          <ActionBar
            hint="অর্ডার দেওয়া আর নাস্তা আসার পর ডেলিভারি মার্ক করুন।"
            actions={
              <ActionButton action={markDeliveredAction.bind(null, menuId)} variant="primary" icon="check">
                ডেলিভারি হয়েছে
              </ActionButton>
            }
          >
            <details className="group mt-4 border-t border-slate-200/70 pt-4">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-slate-900 [&::-webkit-details-marker]:hidden">
                <Icon name="chevron-right" className="size-4 transition group-open:rotate-90" />
                আবার খুলতে হবে?
              </summary>
              <div className="mt-3 space-y-3">
                <p className="text-sm text-slate-500">
                  নতুন কাটঅফ লাগবে। বন্ধের সময় অটো-বসানো ডিফল্টগুলো মুছে যাবে; যারা নিজে বেছেছিল তাদের বাছাই থাকবে।
                </p>
                <ReopenForm action={reopenMenuAction.bind(null, menuId)} />
              </div>
            </details>
          </ActionBar>
        )}
      </section>

      {menu.status === "draft" ? (
        <DraftSection menuId={menuId} menu={menu} options={options} />
      ) : canAssign ? (
        <section className={cardClass}>
          <Tabs
            tabs={[
              {
                id: "items",
                label: "আইটেম",
                icon: "cookie",
                count: options.length,
                content: <ItemsPanel menuId={menuId} options={options} people={people} />,
              },
              {
                id: "guests",
                label: "গেস্ট",
                icon: "user-plus",
                count: guests.length,
                content: <GuestPanel menuId={menuId} options={options} guests={guests} />,
              },
              {
                id: "leave",
                label: "ছুটি",
                icon: "calendar",
                count: leaves.length,
                content: <LeavePanel menuDate={menu.menuDate} employees={employees} />,
              },
              {
                id: "assign",
                label: "বরাদ্দ",
                icon: "users",
                content: <AssignPanel menuId={menuId} options={options} employees={employees} />,
              },
            ]}
          />
        </section>
      ) : (
        <section className={cardClass}>
          <CardTitle
            title="আইটেম"
            description={`${formatNumber(options.length)}টি আইটেম`}
            icon="cookie"
            tone="orange"
          />
          <ItemList options={options} />
        </section>
      )}
    </div>
  );
}

// স্ট্যাটাস কার্ডের নিচের ফুটার: বাঁয়ে ব্যাখ্যা, ডানে বাটন
function ActionBar({ hint, actions, children }: { hint: string; actions: ReactNode; children?: ReactNode }) {
  return (
    <div className="-mx-5 mt-6 -mb-5 rounded-b-3xl border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:-mx-6 sm:-mb-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm text-slate-500">
          <Icon name="info" className="mt-0.5 size-4 shrink-0" />
          {hint}
        </p>
        <div className="flex flex-wrap gap-3">{actions}</div>
      </div>
      {children}
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

function ItemList({
  options,
  footer,
  extra,
}: {
  options: MenuOption[];
  footer?: (option: MenuOption) => ReactNode;
  extra?: ReactNode;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => {
        const styles = CATEGORY_STYLES[option.category];
        return (
          <li
            key={option.snackItemId}
            className="flex flex-col rounded-2xl border border-slate-200/70 bg-slate-50/50 p-3"
          >
            <div className="flex items-center gap-3">
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
            </div>
            {footer && <div className="mt-auto">{footer(option)}</div>}
          </li>
        );
      })}
      {extra && <li>{extra}</li>}
    </ul>
  );
}

async function ItemsPanel({
  menuId,
  options,
  people,
}: {
  menuId: number;
  options: MenuOption[];
  people: PersonChoice[];
}) {
  const candidates = await listSnacksToAdd(menuId);
  // খোলা মেনুতে যারা এখনো বাছেনি তারাও ডিফল্ট হিসেবে ধরা, সাথে গেস্ট
  const takenBy = (snackItemId: number) => people.filter((person) => person.snackItemId === snackItemId).length;
  // নিজে বেছেছে বা বরাদ্দ পেয়েছে (গেস্টসহ); এমন কেউ থাকলে আইটেম আর বদলানো বা সরানো যায় না
  const chosenBy = (snackItemId: number) =>
    people.filter((person) => person.snackItemId === snackItemId && !person.isDefault).length;

  return (
    <Panel description="কেউ নিজে বেছে নিলে বা বরাদ্দ পেলে (গেস্টসহ) সেই আইটেম আর বদলানো বা সরানো যায় না। বদলালে একই গ্রুপের আইটেম দিতে হবে, যারা ডিফল্ট হিসেবে পাচ্ছিল তারা নতুনটা পাবে। ডিফল্ট নয় এমন আইটেম কেউ না নিলে সরানো যায়। ৩টার কম থাকলে আরেকটা যোগ করা যায়।">
      <ItemList
        options={options}
        footer={(option) => (
          <MenuItemActions
            itemName={option.name}
            takenBy={takenBy(option.snackItemId)}
            chosenBy={chosenBy(option.snackItemId)}
            canRemove={!option.isDefault && takenBy(option.snackItemId) === 0}
            candidates={candidates.filter((snack) => snack.category === option.category)}
            replaceAction={replaceMenuItemAction.bind(null, menuId, option.snackItemId)}
            removeAction={removeMenuItemAction.bind(null, menuId, option.snackItemId)}
          />
        )}
        extra={
          options.length < 3 && (
            <AddMenuItemCard action={addMenuItemAction.bind(null, menuId)} candidates={candidates} />
          )
        }
      />
    </Panel>
  );
}

// ট্যাবের ভেতর: উপরে ব্যাখ্যা, তারপর বাঁয়ে ফর্ম আর ডানে তালিকা (বড় স্ক্রিনে); তালিকা না থাকলে ফর্ম পুরো চওড়া
function Panel({ description, list, children }: { description: string; list?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">{description}</p>
      {list ? (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div>{children}</div>
          {list}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function PersonRow({ name, detail, children }: { name: string; detail: string; children: ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
      <span className="flex min-w-0 items-center gap-3">
        <Avatar name={name} className="size-8 text-xs" />
        <span className="min-w-0">
          <span className="block truncate font-medium text-slate-900">{name}</span>
          <span className="block text-xs text-slate-500">{detail}</span>
        </span>
      </span>
      {children}
    </li>
  );
}

function PersonList({ empty, children }: { empty: string; children: ReactNode[] }) {
  if (children.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center text-sm text-slate-500">
        {empty}
      </p>
    );
  }
  return <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200/70">{children}</ul>;
}

function leaveGivenBy(leave: Leave): string {
  if (leave.source === "self") return "নিজে দিয়েছে";
  if (leave.source === "api") return "অটো (API)";
  return `দিয়েছেন: ${leave.createdByName ?? ""}`;
}

function choiceNote(choice: PersonChoice | undefined): string | null {
  if (!choice) return "কিছু বরাদ্দ নেই";
  if (choice.assignedByName) return `বরাদ্দ: ${choice.assignedByName}`;
  return choice.isDefault ? null : "নিজে বেছেছে";
}

// সক্রিয় সবাই: এখন কী পাচ্ছে, তার গ্রুপের ডিফল্ট কী, আর ছুটিতে আছে কিনা
async function listEmployees(
  options: MenuOption[],
  people: PersonChoice[],
  leaves: Leave[],
): Promise<EmployeeRow[]> {
  const db = await getDb();
  const result = await db.execute(
    "SELECT id, name, employee_id, default_category FROM users WHERE is_active = 1 ORDER BY name COLLATE NOCASE",
  );
  const current = new Map(people.map((person) => [person.userId, person]));
  const leaveOf = new Map(leaves.map((leave) => [leave.userId, leave]));

  return result.rows.map((row) => {
    const id = Number(row.id);
    const choice = current.get(id);
    const leave = leaveOf.get(id);
    const groupDefault = options.find((option) => option.category === row.default_category && option.isDefault);
    return {
      id,
      name: String(row.name),
      employeeId: String(row.employee_id),
      choice: choice && !choice.isDefault ? String(choice.snackItemId) : "default",
      choiceNote: choiceNote(choice),
      defaultItemName: groupDefault?.name ?? "",
      leaveNote: leave ? leaveGivenBy(leave) : null,
    };
  });
}

function AssignPanel({
  menuId,
  options,
  employees,
}: {
  menuId: number;
  options: MenuOption[];
  employees: EmployeeRow[];
}) {
  return (
    <Panel description="কেউ সাইটে ঢুকতে না পারলে তার হয়ে আইটেম বরাদ্দ করুন, বদলালেই সেভ হবে। সারাংশে আপনার নাম দেখাবে। মেনু খোলা থাকলে সে নিজে পরে বদলাতে পারবে।">
      <AssignList employees={employees} options={options} action={setAssignmentAction.bind(null, menuId)} />
    </Panel>
  );
}

function LeavePanel({ menuDate, employees }: { menuDate: string; employees: EmployeeRow[] }) {
  return (
    <Panel description="এই দিন যারা অফিসে নেই, তাদের সুইচ চালু করুন। ছুটিতে থাকলে কিছুই পাবে না (ডিফল্টও না), আগের বাছাইও মুছে যাবে। মেনু বন্ধ হওয়ার পর ছুটি বাতিল করলে সে ডিফল্ট পাবে।">
      <LeaveList employees={employees} action={setLeaveAction.bind(null, menuDate)} />
    </Panel>
  );
}

function GuestPanel({
  menuId,
  options,
  guests,
}: {
  menuId: number;
  options: MenuOption[];
  guests: (PersonChoice & { guestId: number })[];
}) {
  return (
    <Panel
      description="অফিসের বাইরের কেউ এলে। নম্বর নিজে থেকে বসবে (গেস্ট ১, ২…), খরচ মোট হিসাবে যোগ হবে।"
      list={
        <PersonList empty="এখনো কোনো গেস্ট নেই।">
          {guests.map((guest) => (
            <PersonRow
              key={guest.guestId}
              name={guest.name}
              detail={`${itemName(options, guest.snackItemId)} · দিয়েছেন: ${guest.assignedByName}`}
            >
              <ActionButton
                action={removeGuestAction.bind(null, menuId, guest.guestId)}
                variant="subtle"
                icon="trash"
                confirmMessage={`${guest.name} মুছে ফেলবেন?`}
              >
                মুছুন
              </ActionButton>
            </PersonRow>
          ))}
        </PersonList>
      }
    >
      <GuestForm action={addGuestAction.bind(null, menuId)} options={options} />
    </Panel>
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
