"use client";

import { useActionState } from "react";
import { Field, FormMessage, inputClass, SubmitButton } from "@/components/form";
import { Icon } from "@/components/icons";
import { Callout, CATEGORY_STYLES, IconTile } from "@/components/ui";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants";
import { formatTaka } from "@/lib/format";
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

type MenuItemOption = { snackItemId: number; name: string; category: Category };

function ItemSelect({ options, defaultValue }: { options: MenuItemOption[]; defaultValue?: string }) {
  return (
    <Field label="আইটেম">
      <select name="snackItemId" required defaultValue={defaultValue ?? ""} className={inputClass}>
        <option value="" disabled>
          আইটেম বাছাই করুন
        </option>
        {CATEGORIES.map((category) => (
          <optgroup key={category} label={CATEGORY_LABELS[category]}>
            {options
              .filter((option) => option.category === category)
              .map((option) => (
                <option key={option.snackItemId} value={option.snackItemId}>
                  {option.name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </Field>
  );
}

export function AssignForm({
  action,
  users,
  options,
}: {
  action: Action;
  users: { id: number; label: string }[];
  options: MenuItemOption[];
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <Field label="এমপ্লয়ি">
        <select name="userId" required defaultValue={state.values?.userId ?? ""} className={inputClass}>
          <option value="" disabled>
            এমপ্লয়ি বাছাই করুন
          </option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.label}
            </option>
          ))}
        </select>
      </Field>
      <ItemSelect options={options} defaultValue={state.values?.snackItemId} />
      <SubmitButton pending={pending}>সেভ করুন</SubmitButton>
    </form>
  );
}

export function GuestForm({ action, options }: { action: Action; options: MenuItemOption[] }) {
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
      <ItemSelect options={options} defaultValue={state.values?.snackItemId} />
      <SubmitButton pending={pending}>গেস্ট যোগ করুন</SubmitButton>
    </form>
  );
}
