"use client";

import { useActionState } from "react";
import { Field, FormMessage, inputClass, SubmitButton } from "@/components/form";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} />
      <Field label="Employee ID">
        <input
          name="employeeId"
          defaultValue={state.employeeId}
          autoComplete="username"
          autoCapitalize="none"
          required
          className={inputClass}
        />
      </Field>
      <Field label="পাসওয়ার্ড">
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      <SubmitButton pending={pending}>লগইন</SubmitButton>
    </form>
  );
}
