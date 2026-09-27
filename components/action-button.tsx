"use client";

import { useActionState, type ReactNode } from "react";
import { FormMessage } from "@/components/form";
import type { FormState } from "@/lib/form";

const VARIANTS = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  confirmMessage?: string;
};

// একটা বাটনেই কাজ শেষ এমন action-এর জন্য (যেমন সক্রিয়/নিষ্ক্রিয় করা)
export function ActionButton({ action, children, variant = "secondary", confirmMessage }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
      }}
      className="space-y-2"
    >
      <button
        type="submit"
        disabled={pending}
        className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60 ${VARIANTS[variant]}`}
      >
        {pending ? "অপেক্ষা করুন…" : children}
      </button>
      <FormMessage error={state.error} success={state.success} />
    </form>
  );
}
