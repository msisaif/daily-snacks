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
import { ROLE_LABELS, ROLE_OPTIONS, type Category, type Role } from "@/lib/constants";
import type { FormState } from "@/lib/form";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function CreateUserForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values;

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage error={state.error} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Employee ID">
          <input
            name="employeeId"
            defaultValue={values?.employeeId}
            required
            maxLength={50}
            autoCapitalize="characters"
            autoComplete="off"
            className={inputClass}
          />
        </Field>
        <Field label="নাম">
          <input
            name="name"
            defaultValue={values?.name}
            required
            maxLength={100}
            autoComplete="off"
            className={inputClass}
          />
        </Field>
        <Field label="অস্থায়ী পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" hint="প্রথম লগইনে ইউজারকে এটা বদলাতে হবে।">
          <input
            name="password"
            type="text"
            required
            minLength={6}
            autoComplete="off"
            className={inputClass}
          />
        </Field>
        <RadioGroup
          label="রোল"
          name="role"
          options={ROLE_OPTIONS}
          defaultValue={values?.role ?? "member"}
        />
        <div className="sm:col-span-2">
          <RadioGroup
            label="ডিফল্ট গ্রুপ"
            name="defaultCategory"
            options={CATEGORY_RADIO_OPTIONS}
            defaultValue={values?.defaultCategory ?? "healthy"}
          />
        </div>
      </div>
      <SubmitButton pending={pending}>ইউজার তৈরি করুন</SubmitButton>
    </form>
  );
}

type EditUserFormProps = {
  action: Action;
  name: string;
  role: Role;
  defaultCategory: Category;
  isSelf: boolean;
};

export function EditUserForm({ action, name, role, defaultCategory, isSelf }: EditUserFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
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
        {isSelf ? (
          <div className="text-sm">
            <input type="hidden" name="role" value="admin" />
            <span className="mb-1.5 block font-medium text-slate-700">রোল</span>
            <span className="block rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium text-slate-700">
              {ROLE_LABELS.admin}
            </span>
            <span className="mt-1.5 block text-xs text-slate-500">নিজের রোল বদলানো যায় না।</span>
          </div>
        ) : (
          <RadioGroup
            label="রোল"
            name="role"
            options={ROLE_OPTIONS}
            defaultValue={values?.role ?? role}
          />
        )}
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

export function ResetPasswordForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <Field label="নতুন অস্থায়ী পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)">
        <input
          name="password"
          type="text"
          required
          minLength={6}
          autoComplete="off"
          className={inputClass}
        />
      </Field>
      <SubmitButton pending={pending}>পাসওয়ার্ড রিসেট করুন</SubmitButton>
    </form>
  );
}
