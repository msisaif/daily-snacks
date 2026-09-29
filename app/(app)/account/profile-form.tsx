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
import type { FormState } from "@/lib/form";
import { updateProfile } from "./actions";

type Props = {
  name: string;
  defaultCategory: Category;
};

export function ProfileForm({ name, defaultCategory }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateProfile, {});
  const values = state.values;

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage error={state.error} success={state.success} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="নাম">
          <input
            name="name"
            defaultValue={values?.name ?? name}
            required
            maxLength={100}
            className={inputClass}
          />
        </Field>
        <div className="sm:col-span-2">
          <RadioGroup
            label="ডিফল্ট গ্রুপ"
            name="defaultCategory"
            options={CATEGORY_RADIO_OPTIONS}
            defaultValue={values?.defaultCategory ?? defaultCategory}
          />
        </div>
      </div>
      <SubmitButton pending={pending}>সেভ করুন</SubmitButton>
    </form>
  );
}
