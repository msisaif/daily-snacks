"use client";

import { useActionState } from "react";
import { Field, FormMessage, inputClass, SubmitButton } from "@/components/form";
import type { FormState } from "@/lib/form";
import { changePassword } from "../actions";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(changePassword, {});

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <Field label="বর্তমান পাসওয়ার্ড">
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      <Field label="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)">
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className={inputClass}
        />
      </Field>
      <Field label="নতুন পাসওয়ার্ড আবার লিখুন">
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className={inputClass}
        />
      </Field>
      <SubmitButton pending={pending}>পাসওয়ার্ড বদলান</SubmitButton>
    </form>
  );
}
