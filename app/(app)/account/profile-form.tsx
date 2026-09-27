"use client";

import { useActionState } from "react";
import { Field, FormMessage, inputClass, SubmitButton } from "@/components/form";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants";
import type { FormState } from "@/lib/form";
import { updateProfile } from "./actions";

type Props = {
  name: string;
  defaultCategory: Category;
};

export function ProfileForm({ name, defaultCategory }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateProfile, {});

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <Field label="নাম">
        <input name="name" defaultValue={name} required maxLength={100} className={inputClass} />
      </Field>

      <fieldset>
        <legend className="mb-1 text-sm font-medium text-slate-700">ডিফল্ট গ্রুপ</legend>
        <p className="mb-2 text-xs text-slate-500">
          কোনো দিন কিছু না বাছলে এই গ্রুপের ডিফল্ট আইটেমটা পাবেন।
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 has-checked:border-emerald-600 has-checked:bg-emerald-50"
            >
              <input
                type="radio"
                name="defaultCategory"
                value={category}
                defaultChecked={category === defaultCategory}
                className="accent-emerald-600"
              />
              {CATEGORY_LABELS[category]}
            </label>
          ))}
        </div>
      </fieldset>

      <SubmitButton pending={pending}>সেভ করুন</SubmitButton>
    </form>
  );
}
