import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { buttonClass, CATEGORY_STYLES } from "@/components/ui";
import { CATEGORY_OPTIONS } from "@/lib/constants";

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15";

export function Field({
  label,
  hint,
  className = "",
  children,
}: {
  label: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

type RadioGroupProps = {
  label: string;
  name: string;
  options: { value: string; label: string; icon?: IconName }[];
  defaultValue?: string;
  hint?: string;
};

// গ্রুপ বাছাইয়ের রেডিওতে গ্রুপের আইকনও দেখায়
export const CATEGORY_RADIO_OPTIONS = CATEGORY_OPTIONS.map((option) => ({
  ...option,
  icon: CATEGORY_STYLES[option.value].icon,
}));

export function RadioGroup({ label, name, options, defaultValue, hint }: RadioGroupProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-sm font-medium text-slate-700">{label}</legend>
      {hint && <p className="mb-2 text-xs text-slate-500">{hint}</p>}
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xs transition hover:border-slate-300 has-checked:border-emerald-500 has-checked:bg-emerald-50/70 has-checked:ring-2 has-checked:ring-emerald-500/20 has-focus-visible:ring-2 has-focus-visible:ring-emerald-500/40"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              required
              className="size-4 shrink-0 accent-emerald-600"
            />
            {option.icon && (
              <Icon
                name={option.icon}
                className="size-4 shrink-0 text-slate-400 transition group-has-checked:text-emerald-600"
              />
            )}
            <span className="leading-snug font-medium text-slate-700">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Spinner() {
  return <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />;
}

export function SubmitButton({
  pending,
  className = "w-full sm:w-auto sm:min-w-44",
  children,
}: {
  pending: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button type="submit" disabled={pending} className={`${buttonClass.primary} ${className}`}>
      {pending ? (
        <>
          <Spinner />
          অপেক্ষা করুন…
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (error) {
    return (
      <p
        role="alert"
        className="flex animate-rise items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
      >
        <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p
        role="status"
        className="flex animate-rise items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800"
      >
        <Icon name="check-circle" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        {success}
      </p>
    );
  }
  return null;
}
