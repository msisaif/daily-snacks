"use client";

import { useActionState } from "react";
import { Field, FormMessage, inputClass, SubmitButton } from "@/components/form";
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
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <Field label="জনপ্রতি দৈনিক বাজেট (টাকা)">
        <input
          name="budgetPerPerson"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          defaultValue={values?.budgetPerPerson ?? budgetPerPerson}
          required
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-slate-500">
          কোনো আইটেমের দাম এর বেশি হতে পারবে না। আগে থেকে খোলা মেনুতে প্রভাব পড়বে না।
        </span>
      </Field>
      <Field label="ডিফল্ট কাটঅফ সময় (বাংলাদেশ সময়)">
        <input
          name="defaultCutoffTime"
          type="time"
          defaultValue={values?.defaultCutoffTime ?? defaultCutoffTime}
          required
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-slate-500">
          নতুন মেনু বানানোর সময় এটাই কাটঅফ হিসেবে বসবে; প্রতিটা মেনুতে আলাদা করে বদলানো যাবে।
        </span>
      </Field>
      <SubmitButton pending={pending}>সেভ করুন</SubmitButton>
    </form>
  );
}
