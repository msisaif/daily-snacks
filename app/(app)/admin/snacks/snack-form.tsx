"use client";

import { useActionState } from "react";
import { Field, FormMessage, inputClass, RadioGroup, SubmitButton } from "@/components/form";
import { CATEGORY_OPTIONS, type Category } from "@/lib/constants";
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
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <Field label="নাম">
        <input
          name="name"
          defaultValue={values?.name ?? initial?.name}
          required
          maxLength={100}
          className={inputClass}
        />
      </Field>
      <Field label="বিবরণ (ঐচ্ছিক)">
        <textarea
          name="description"
          defaultValue={values?.description ?? initial?.description}
          maxLength={300}
          rows={2}
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
      <RadioGroup
        label="গ্রুপ"
        name="category"
        options={CATEGORY_OPTIONS}
        defaultValue={values?.category ?? initial?.category}
      />
      <Field label="ছবির লিংক (ঐচ্ছিক)">
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
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={values ? values.isActive === "on" : initial.isActive}
            className="size-4 accent-emerald-600"
          />
          <span>সক্রিয় (মেনুতে যোগ করা যাবে)</span>
        </label>
      )}
      <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
    </form>
  );
}
