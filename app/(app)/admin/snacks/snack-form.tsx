"use client";

import { useActionState } from "react";
import {
  CATEGORY_RADIO_OPTIONS,
  Field,
  FormMessage,
  inputClass,
  RadioGroup,
  SubmitButton,
} from "@/components/form";
import type { Category } from "@/lib/constants";
import { formatTaka } from "@/lib/format";
import type { FormState } from "@/lib/form";

export type SnackFormValues = {
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  isActive: boolean;
};

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  budget: number;
  initial?: SnackFormValues;
  submitLabel: string;
};

export function SnackForm({ action, budget, initial, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values;

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage error={state.error} success={state.success} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="নাম">
          <input
            name="name"
            defaultValue={values?.name ?? initial?.name}
            required
            maxLength={100}
            className={inputClass}
          />
        </Field>
        <Field label={`দাম, টাকায় (সর্বোচ্চ ${formatTaka(budget)})`}>
          <input
            name="price"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            max={budget}
            defaultValue={values?.price ?? initial?.price}
            required
            className={inputClass}
          />
        </Field>
        <Field label="বিবরণ (ঐচ্ছিক)" className="sm:col-span-2">
          <textarea
            name="description"
            defaultValue={values?.description ?? initial?.description}
            maxLength={300}
            rows={2}
            className={inputClass}
          />
        </Field>
        <div className="sm:col-span-2">
          <RadioGroup
            label="গ্রুপ"
            name="category"
            options={CATEGORY_RADIO_OPTIONS}
            defaultValue={values?.category ?? initial?.category}
          />
        </div>
        <Field label="ছবির লিংক (ঐচ্ছিক)" className="sm:col-span-2">
          <input
            name="imageUrl"
            type="url"
            placeholder="https://…"
            defaultValue={values?.imageUrl ?? initial?.imageUrl}
            maxLength={500}
            className={inputClass}
          />
        </Field>
        {initial && (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-xs transition hover:border-slate-300 has-checked:border-emerald-500 has-checked:bg-emerald-50/70 sm:col-span-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={values ? values.isActive === "on" : initial.isActive}
              className="size-4.5 accent-emerald-600"
            />
            <span className="font-medium text-slate-700">সক্রিয় (মেনুতে যোগ করা যাবে)</span>
          </label>
        )}
      </div>
      <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
    </form>
  );
}
