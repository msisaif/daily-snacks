"use client";

import { useActionState, type ReactNode } from "react";
import { FormMessage, Spinner } from "@/components/form";
import { Icon, type IconName } from "@/components/icons";
import { buttonClass } from "@/components/ui";
import type { FormState } from "@/lib/form";

const VARIANTS = {
  ...buttonClass,
  subtle:
    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60",
};

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  icon?: IconName;
  confirmMessage?: string;
  className?: string;
};

// একটা বাটনেই কাজ শেষ এমন action-এর জন্য (যেমন সক্রিয়/নিষ্ক্রিয় করা)
export function ActionButton({
  action,
  children,
  variant = "secondary",
  icon,
  confirmMessage,
  className = "",
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
      }}
      className="space-y-2"
    >
      <button type="submit" disabled={pending} className={`${VARIANTS[variant]} ${className}`}>
        {pending ? <Spinner /> : icon && <Icon name={icon} className="size-4" />}
        {pending ? "অপেক্ষা করুন…" : children}
      </button>
      <FormMessage error={state.error} success={state.success} />
    </form>
  );
}
