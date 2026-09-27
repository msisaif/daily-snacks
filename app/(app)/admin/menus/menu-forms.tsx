"use client";

import { useActionState } from "react";
import { Field, FormMessage, inputClass, SubmitButton } from "@/components/form";
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
    <form action={formAction} className="space-y-5">
      <FormMessage error={state.error} success={state.success} />

      <div className="grid gap-4 sm:grid-cols-2">
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
        <Field label="কাটঅফ (বাংলাদেশ সময়)">
          <input
            name="cutoff"
            type="datetime-local"
            defaultValue={values?.cutoff ?? initial?.cutoff ?? ""}
            className={inputClass}
          />
          <span className="mt-1 block text-xs text-slate-500">
            খালি রাখলে: মেনুর তারিখের {defaultCutoffTime}
          </span>
        </Field>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-slate-600">
          ২ বা ৩টা আইটেম বাছাই করুন, দুই গ্রুপ থেকেই অন্তত একটা। প্রতি গ্রুপে একটা আইটেমকে
          &quot;ডিফল্ট&quot; দিন। কেউ কিছু না বাছলে সে তার গ্রুপের ডিফল্টটা পাবে। গ্রুপে একটাই আইটেম
          থাকলে সেটাই নিজে থেকে ডিফল্ট হবে।
        </p>

        {CATEGORIES.map((category) => {
          const inCategory = snacks.filter((snack) => snack.category === category);
          return (
            <fieldset key={category} className="space-y-2">
              <legend className="mb-1 font-semibold">{CATEGORY_LABELS[category]}</legend>
              {inCategory.length === 0 && (
                <p className="text-sm text-slate-500">এই গ্রুপে কোনো সক্রিয় আইটেম নেই।</p>
              )}
              {inCategory.map((snack) => (
                <div
                  key={snack.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 has-[input[name=snackIds]:checked]:border-emerald-600 has-[input[name=snackIds]:checked]:bg-emerald-50"
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      name="snackIds"
                      value={snack.id}
                      defaultChecked={checkedIds.includes(String(snack.id))}
                      className="size-4 accent-emerald-600"
                    />
                    <span className="truncate">{snack.name}</span>
                    <span className="shrink-0 text-sm text-slate-500">{formatTaka(snack.price)}</span>
                    {!snack.isActive && <span className="text-xs text-red-600">(নিষ্ক্রিয়)</span>}
                  </label>
                  <label className="flex shrink-0 cursor-pointer items-center gap-1 text-sm text-slate-600">
                    <input
                      type="radio"
                      name={`default_${category}`}
                      value={snack.id}
                      defaultChecked={defaultIds.includes(String(snack.id))}
                      className="accent-emerald-600"
                    />
                    ডিফল্ট
                  </label>
                </div>
              ))}
            </fieldset>
          );
        })}
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
    <form action={formAction} className="space-y-3">
      <FormMessage error={state.error} success={state.success} />
      <Field label="নতুন কাটঅফ (বাংলাদেশ সময়)">
        <input name="cutoff" type="datetime-local" required className={inputClass} />
      </Field>
      <SubmitButton pending={pending}>আবার খুলুন</SubmitButton>
    </form>
  );
}
