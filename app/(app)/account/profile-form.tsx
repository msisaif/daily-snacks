"use client";

import { useActionState } from "react";
import { Field, FormMessage, inputClass, RadioGroup, SubmitButton } from "@/components/form";
import { CATEGORY_OPTIONS, type Category } from "@/lib/constants";
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
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <Field label="নাম">
        <input
          name="name"
          defaultValue={values?.name ?? name}
          required
          maxLength={100}
          className={inputClass}
        />
      </Field>
      <RadioGroup
        label="ডিফল্ট গ্রুপ"
        hint="কোনো দিন কিছু না বাছলে এই গ্রুপের ডিফল্ট আইটেমটা পাবেন।"
        name="defaultCategory"
        options={CATEGORY_OPTIONS}
        defaultValue={values?.defaultCategory ?? defaultCategory}
      />
      <SubmitButton pending={pending}>সেভ করুন</SubmitButton>
    </form>
  );
}
