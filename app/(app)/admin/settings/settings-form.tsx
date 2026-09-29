"use client";

import { useActionState } from "react";
import { Field, FormMessage, inputClass, numberInputProps, SubmitButton } from "@/components/form";
import type { FormState } from "@/lib/form";
import { updateSettings } from "./actions";

type Props = {
  budgetPerPerson: number;
  defaultCutoffTime: string;
};

export function SettingsForm({ budgetPerPerson, defaultCutoffTime }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateSettings, {});
  const values = state.values;

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage error={state.error} success={state.success} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="জনপ্রতি দৈনিক বাজেট (টাকা)"
          hint="কোনো আইটেমের দাম এর বেশি হতে পারবে না। আগে থেকে খোলা মেনুতে প্রভাব পড়বে না।"
        >
          <input
            name="budgetPerPerson"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            defaultValue={values?.budgetPerPerson ?? budgetPerPerson}
            {...numberInputProps}
            required
            className={inputClass}
          />
        </Field>
        <Field
          label="ডিফল্ট কাটঅফ সময় (বাংলাদেশ সময়)"
          hint="নতুন মেনু বানানোর সময় এটাই কাটঅফ হিসেবে বসবে; প্রতিটা মেনুতে আলাদা করে বদলানো যাবে।"
        >
          <input
            name="defaultCutoffTime"
            type="time"
            defaultValue={values?.defaultCutoffTime ?? defaultCutoffTime}
            required
            className={inputClass}
          />
        </Field>
      </div>
      <SubmitButton pending={pending}>সেভ করুন</SubmitButton>
    </form>
  );
}
