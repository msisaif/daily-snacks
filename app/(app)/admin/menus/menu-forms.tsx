"use client";

import { useActionState, useOptimistic, useState, useTransition, type ReactNode } from "react";
import { ActionButton } from "@/components/action-button";
import { Field, FormMessage, inputClass, Spinner, SubmitButton } from "@/components/form";
import { Icon } from "@/components/icons";
import { SnackDialog, SnackField, type SnackPickerItem } from "@/components/snack-picker";
import { Avatar, Callout, CATEGORY_STYLES, IconTile } from "@/components/ui";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants";
import { formatNumber, formatTaka } from "@/lib/format";
import type { FormState } from "@/lib/form";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

type SnackOption = {
  id: number;
  name: string;
  category: Category;
  price: number;
  isActive: boolean;
};

type MenuFormProps = {
  action: Action;
  snacks: SnackOption[];
  minDate: string;
  defaultCutoffTime: string;
  submitLabel: string;
  initial?: {
    menuDate: string;
    cutoff: string;
    note: string;
    snackIds: number[];
    defaultIds: number[];
  };
};

// বাছাই করা আইটেমের সারি গ্রুপের রঙে হাইলাইট হয়
const CHECKED_ROW: Record<Category, { row: string; checkbox: string }> = {
  healthy: {
    row: "has-[input[name=snackIds]:checked]:border-emerald-500 has-[input[name=snackIds]:checked]:bg-emerald-50/70 has-[input[name=snackIds]:checked]:ring-2 has-[input[name=snackIds]:checked]:ring-emerald-500/20",
    checkbox: "accent-emerald-600",
  },
  unhealthy: {
    row: "has-[input[name=snackIds]:checked]:border-orange-500 has-[input[name=snackIds]:checked]:bg-orange-50/70 has-[input[name=snackIds]:checked]:ring-2 has-[input[name=snackIds]:checked]:ring-orange-500/20",
    checkbox: "accent-orange-600",
  },
};

export function MenuForm({
  action,
  snacks,
  minDate,
  defaultCutoffTime,
  submitLabel,
  initial,
}: MenuFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values;

  // এরর হলে ইউজারের শেষ বাছাই, নইলে সেভ করা মান
  const checkedIds = values
    ? (values.snackIds ?? "").split(",")
    : (initial?.snackIds ?? []).map(String);
  const defaultIds = values
    ? [values.default_healthy, values.default_unhealthy]
    : (initial?.defaultIds ?? []).map(String);

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="তারিখ">
          <input
            name="menuDate"
            type="date"
            min={minDate}
            defaultValue={values?.menuDate ?? initial?.menuDate ?? minDate}
            required
            className={inputClass}
          />
        </Field>
        <Field label="কাটঅফ (বাংলাদেশ সময়)" hint={`খালি রাখলে: মেনুর তারিখের ${defaultCutoffTime}`}>
          <input
            name="cutoff"
            type="datetime-local"
            defaultValue={values?.cutoff ?? initial?.cutoff ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="space-y-4">
        <Callout>
          ২ বা ৩টা আইটেম বাছাই করুন, দুই গ্রুপ থেকেই অন্তত একটা। প্রতি গ্রুপে একটা আইটেমকে
          &quot;ডিফল্ট&quot; দিন। কেউ কিছু না বাছলে সে তার গ্রুপের ডিফল্টটা পাবে। গ্রুপে একটাই আইটেম
          থাকলে সেটাই নিজে থেকে ডিফল্ট হবে।
        </Callout>

        {/* ফ্রেশ (healthy) বাঁয়ে, ক্রিসপি (unhealthy) ডানে */}
        <div className="grid gap-5 md:grid-cols-2">
          {CATEGORIES.map((category) => {
            const inCategory = snacks.filter((snack) => snack.category === category);
            const styles = CATEGORY_STYLES[category];
            return (
              // fieldset-এর ব্রাউজার-ডিফল্ট min-width: min-content, তাই min-w-0 না দিলে গ্রিড ছাপিয়ে যায়
              <fieldset
                key={category}
                className={`min-w-0 space-y-2.5 rounded-3xl border p-3 sm:p-4 ${styles.panel}`}
              >
                <legend className="sr-only">{CATEGORY_LABELS[category]}</legend>
                <div className="flex items-center gap-2.5 px-1 pb-1">
                  <IconTile icon={styles.icon} tone={styles.tone} size="sm" />
                  <span className={`font-display text-lg leading-tight font-bold ${styles.text}`}>
                    {CATEGORY_LABELS[category]}
                  </span>
                </div>
                {inCategory.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-center text-sm text-slate-500">
                    এই গ্রুপে কোনো সক্রিয় আইটেম নেই।
                  </p>
                )}
                {inCategory.map((snack) => (
                  <div
                    key={snack.id}
                    className={`flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-xs transition hover:border-slate-300 ${CHECKED_ROW[category].row}`}
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        name="snackIds"
                        value={snack.id}
                        defaultChecked={checkedIds.includes(String(snack.id))}
                        className={`size-4.5 shrink-0 ${CHECKED_ROW[category].checkbox}`}
                      />
                      <span className="min-w-0">
                        <span className="block leading-snug font-medium text-slate-900">{snack.name}</span>
                        <span className="text-sm text-slate-500">
                          {formatTaka(snack.price)}
                          {!snack.isActive && <span className="ml-1.5 text-xs text-rose-600">(নিষ্ক্রিয়)</span>}
                        </span>
                      </span>
                    </label>
                    <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:border-amber-300 hover:text-amber-700 has-checked:border-amber-300 has-checked:bg-amber-50 has-checked:text-amber-700 has-focus-visible:ring-2 has-focus-visible:ring-amber-400/50 has-checked:[&_svg]:fill-amber-400">
                      <input
                        type="radio"
                        name={`default_${category}`}
                        value={snack.id}
                        defaultChecked={defaultIds.includes(String(snack.id))}
                        className="sr-only"
                      />
                      <Icon name="star" className="size-3.5" />
                      ডিফল্ট
                    </label>
                  </div>
                ))}
              </fieldset>
            );
          })}
        </div>
      </div>

      <Field label="নোট (ঐচ্ছিক, সবাই দেখবে)">
        <textarea
          name="note"
          rows={2}
          maxLength={200}
          defaultValue={values?.note ?? initial?.note}
          className={inputClass}
        />
      </Field>

      <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
    </form>
  );
}

export function ReopenForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="নতুন কাটঅফ (বাংলাদেশ সময়)" className="flex-1">
          <input name="cutoff" type="datetime-local" required className={inputClass} />
        </Field>
        <SubmitButton pending={pending}>আবার খুলুন</SubmitButton>
      </div>
    </form>
  );
}

const NO_SNACK_TO_ADD = "মেনুতে বসানোর মতো আর কোনো সক্রিয় আইটেম নেই (বাজেটের মধ্যে)।";

// modal-এ আইটেমে ক্লিক করলেই সেভ হয়; চলার সময় spinner, এরর হলে কার্ডে দেখায়
function useInstantAction(action: (snackItemId: number) => Promise<FormState>) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function run(choice: string) {
    setOpen(false);
    setError(undefined);
    startTransition(async () => {
      const result = await action(Number(choice));
      if (result.error) setError(result.error);
    });
  }

  return { open, setOpen, pending, error, run };
}

// আইটেম কার্ডের নিচের অংশ: কতজন পাচ্ছে, আর বদলানো / সরানো
export function MenuItemActions({
  itemName,
  takenBy,
  chosenBy,
  canRemove,
  candidates,
  replaceAction,
  removeAction,
}: {
  itemName: string;
  takenBy: number;
  chosenBy: number; // নিজে বেছেছে বা বরাদ্দ পেয়েছে; থাকলে বদলানো বা সরানো যায় না
  canRemove: boolean;
  candidates: SnackPickerItem[]; // একই গ্রুপের
  replaceAction: (snackItemId: number) => Promise<FormState>;
  removeAction: Action;
}) {
  const replace = useInstantAction(replaceAction);
  const people = takenBy > 0 ? ` যে ${formatNumber(takenBy)} জন ডিফল্ট হিসেবে এটা পাচ্ছে, তারা নতুনটা পাবে।` : "";

  if (chosenBy > 0) {
    return (
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200/70 pt-3">
        <span className="text-xs text-slate-500">{formatNumber(takenBy)} জন পাচ্ছে</span>
        <span
          title="কেউ নিজে বেছেছে বা বরাদ্দ পেয়েছে, তাই বদলানো বা সরানো যাবে না"
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500"
        >
          <Icon name="lock" className="size-3.5" />
          {formatNumber(chosenBy)} জন বেছে নিয়েছে
        </span>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2 border-t border-slate-200/70 pt-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">
          {takenBy > 0 ? `${formatNumber(takenBy)} জন পাচ্ছে` : "কেউ নেয়নি"}
        </span>
        <div className="flex items-start gap-1">
          <button
            type="button"
            onClick={() => replace.setOpen(true)}
            disabled={replace.pending || candidates.length === 0}
            title={candidates.length === 0 ? NO_SNACK_TO_ADD : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition enabled:hover:bg-slate-100 enabled:hover:text-slate-900 disabled:opacity-50"
          >
            {replace.pending ? <Spinner /> : <Icon name="arrow-left-right" className="size-4" />}
            {replace.pending ? "বদলানো হচ্ছে…" : "বদলান"}
          </button>
          {canRemove && !replace.pending && (
            <ActionButton
              action={removeAction}
              variant="subtle"
              icon="trash"
              confirmMessage="এই আইটেম মেনু থেকে সরাবেন?"
            >
              সরান
            </ActionButton>
          )}
        </div>
      </div>
      {replace.error && <p className="text-xs font-medium text-rose-600">{replace.error}</p>}
      <SnackDialog
        open={replace.open}
        onClose={() => replace.setOpen(false)}
        items={candidates}
        onSelect={replace.run}
        title="কোন আইটেম দিয়ে বদলাবেন?"
        subtitle={`"${itemName}"-এর বদলে, একই গ্রুপ থেকে।${people}`}
      />
    </div>
  );
}

// নতুন আইটেম ডিফল্ট হয় না
export function AddMenuItemCard({
  candidates,
  action,
}: {
  candidates: SnackPickerItem[];
  action: (snackItemId: number) => Promise<FormState>;
}) {
  const add = useInstantAction(action);
  const empty = candidates.length === 0;

  return (
    <div className="flex h-full flex-col gap-2">
      <button
        type="button"
        onClick={() => add.setOpen(true)}
        disabled={add.pending || empty}
        className="group flex min-h-32 flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 text-center text-slate-500 transition enabled:hover:border-emerald-400 enabled:hover:bg-emerald-50/50 enabled:hover:text-emerald-700 disabled:cursor-not-allowed"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition group-enabled:group-hover:scale-110">
          {add.pending ? <Spinner /> : <Icon name="plus" className="size-5" />}
        </span>
        <span className="text-sm font-semibold">{add.pending ? "যোগ হচ্ছে…" : "আরেকটা আইটেম যোগ করুন"}</span>
        {empty && <span className="text-xs">{NO_SNACK_TO_ADD}</span>}
      </button>
      {add.error && <p className="text-xs font-medium text-rose-600">{add.error}</p>}
      <SnackDialog
        open={add.open}
        onClose={() => add.setOpen(false)}
        items={candidates}
        onSelect={add.run}
        title="মেনুতে কোন আইটেম যোগ করবেন?"
        subtitle="নতুন আইটেম ডিফল্ট হবে না। শুধু সক্রিয় আর বাজেটের মধ্যের আইটেম দেখানো হচ্ছে।"
      />
    </div>
  );
}

export type EmployeeRow = {
  id: number;
  name: string;
  employeeId: string;
  choice: string; // "default" বা আইটেমের id
  choiceNote: string | null; // যেমন "নিজে বেছেছে", "বরাদ্দ: …"
  defaultItemName: string; // তার গ্রুপের ডিফল্ট আইটেম
  leaveNote: string | null; // ছুটিতে থাকলে কে দিল, নইলে null
};

// নাম বা আইডি দিয়ে খোঁজা যায় এমন তালিকা; প্রতিটা সারি কেমন হবে সেটা বাইরে থেকে আসে
function EmployeeList({
  employees,
  twoColumns = false,
  children,
}: {
  employees: EmployeeRow[];
  twoColumns?: boolean;
  children: (employee: EmployeeRow) => ReactNode;
}) {
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const shown = employees.filter(
    (employee) =>
      search === "" ||
      employee.name.toLowerCase().includes(search) ||
      employee.employeeId.toLowerCase().includes(search),
  );

  return (
    <div className="space-y-3">
      <div className="relative sm:max-w-sm">
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="নাম বা আইডি দিয়ে খুঁজুন"
          aria-label="এমপ্লয়ি খুঁজুন"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3.5 pl-10 text-base text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
        />
      </div>
      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center text-sm text-slate-500">
          {employees.length === 0 ? "কেউ নেই" : "এই নামে বা আইডিতে কাউকে পাওয়া যায়নি"}
        </p>
      ) : (
        <ul className={`grid gap-2.5 ${twoColumns ? "lg:grid-cols-2" : ""}`}>
          {shown.map((employee) => (
            <li key={employee.id}>{children(employee)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmployeeCard({
  employee,
  note,
  highlight = false,
  error,
  children,
}: {
  employee: EmployeeRow;
  note: string | null;
  highlight?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border px-3.5 py-3 transition ${
        highlight ? "border-amber-200 bg-amber-50/70" : "border-slate-200/70 bg-white"
      }`}
    >
      <Avatar name={employee.name} className="size-9 text-sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{employee.name}</p>
        <p className="truncate text-xs text-slate-500">
          {employee.employeeId}
          {note && ` · ${note}`}
        </p>
      </div>
      {children}
      {error && <p className="w-full text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function Switch({
  checked,
  disabled,
  label,
  onToggle,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${
        checked ? "bg-amber-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-white shadow-sm transition ${
          checked ? "translate-x-5.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// বদলালে সাথে সাথে সেভ হয়; সেভ না হওয়া পর্যন্ত নতুন অবস্থাটাই দেখায়, এরর হলে আগেরটায় ফেরে
function LeaveRow({
  employee,
  action,
}: {
  employee: EmployeeRow;
  action: (userId: number, onLeave: boolean) => Promise<FormState>;
}) {
  const isOnLeave = employee.leaveNote !== null;
  const [shownOnLeave, setShownOnLeave] = useOptimistic(isOnLeave);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function toggle() {
    setError(undefined);
    startTransition(async () => {
      setShownOnLeave(!isOnLeave);
      const result = await action(employee.id, !isOnLeave);
      if (result.error) setError(result.error);
    });
  }

  return (
    <EmployeeCard
      employee={employee}
      note={shownOnLeave ? (employee.leaveNote ?? "ছুটিতে") : null}
      highlight={shownOnLeave}
      error={error}
    >
      <Switch checked={shownOnLeave} disabled={pending} label={`${employee.name} ছুটিতে`} onToggle={toggle} />
    </EmployeeCard>
  );
}

export function LeaveList({
  employees,
  action,
}: {
  employees: EmployeeRow[];
  action: (userId: number, onLeave: boolean) => Promise<FormState>;
}) {
  return (
    <EmployeeList employees={employees} twoColumns>
      {(employee) => <LeaveRow employee={employee} action={action} />}
    </EmployeeList>
  );
}

function AssignRow({
  employee,
  options,
  action,
}: {
  employee: EmployeeRow;
  options: SnackPickerItem[];
  action: (userId: number, choice: string) => Promise<FormState>;
}) {
  const [shownChoice, setShownChoice] = useOptimistic(employee.choice);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const isOnLeave = employee.leaveNote !== null;

  function change(choice: string) {
    if (choice === employee.choice) return;
    setError(undefined);
    startTransition(async () => {
      setShownChoice(choice);
      const result = await action(employee.id, choice);
      if (result.error) setError(result.error);
    });
  }

  return (
    <EmployeeCard employee={employee} note={isOnLeave ? null : employee.choiceNote} error={error}>
      {isOnLeave ? (
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">ছুটিতে</span>
      ) : (
        <div className="flex w-full items-center gap-2 sm:w-80">
          {pending && <Spinner />}
          <div className="min-w-0 flex-1">
            <SnackField
              items={options}
              value={shownChoice}
              onChange={change}
              highlight={shownChoice !== "default"}
              disabled={pending}
              title="কোন আইটেম পাবে?"
              subtitle={`${employee.name}-এর জন্য। ক্লিক করলেই সেভ হবে।`}
              defaultChoice={{ note: `ডিফল্ট: ${employee.defaultItemName}` }}
            />
          </div>
        </div>
      )}
    </EmployeeCard>
  );
}

export function AssignList({
  employees,
  options,
  action,
}: {
  employees: EmployeeRow[];
  options: SnackPickerItem[];
  action: (userId: number, choice: string) => Promise<FormState>;
}) {
  return (
    <EmployeeList employees={employees}>
      {(employee) => <AssignRow employee={employee} options={options} action={action} />}
    </EmployeeList>
  );
}

export function GuestForm({ action, options }: { action: Action; options: SnackPickerItem[] }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <Field label="নাম (ঐচ্ছিক)">
        <input
          name="name"
          maxLength={50}
          placeholder="যেমন: ক্লায়েন্ট, রহিম সাহেব"
          defaultValue={state.values?.name}
          className={inputClass}
        />
      </Field>
      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">আইটেম</span>
        <SnackField
          name="snackItemId"
          items={options}
          title="গেস্ট কোন আইটেম পাবে?"
          subtitle="খরচ মোট হিসাবে যোগ হবে।"
        />
      </div>
      <SubmitButton pending={pending}>গেস্ট যোগ করুন</SubmitButton>
    </form>
  );
}
