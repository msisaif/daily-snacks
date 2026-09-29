"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { FormMessage } from "@/components/form";
import { Icon } from "@/components/icons";
import { buttonClass, CATEGORY_STYLES, CategoryIcon, DefaultBadge, IconTile } from "@/components/ui";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants";
import { formatNumber, formatTaka } from "@/lib/format";
import type { FormState } from "@/lib/form";

type Option = {
  snackItemId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: Category;
  price: number;
  isDefault: boolean;
};

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  options: Option[];
  receivingId: number | null;
  hasOwnChoice: boolean;
  canChange: boolean;
};

// পুরোটা একটা form; প্রতিটা কার্ড একটা submit বাটন, যার value = আইটেমের id
export function MenuPicker({ action, options, receivingId, hasOwnChoice, canChange }: Props) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage error={state.error} />

      {/* CATEGORIES-এর ক্রম অনুযায়ী: ফ্রেশ (healthy) বাঁয়ে, ক্রিসপি (unhealthy) ডানে (মোবাইলেও) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {CATEGORIES.map((category) => {
          const inCategory = options.filter((option) => option.category === category);
          const styles = CATEGORY_STYLES[category];
          return (
            <div key={category} className={`min-w-0 rounded-3xl border p-2 sm:p-4 ${styles.panel}`}>
              <div className="mb-3 flex items-center gap-2.5 px-1 pt-1">
                <IconTile icon={styles.icon} tone={styles.tone} size="sm" />
                <h2 className={`font-display text-base leading-tight font-bold sm:text-lg ${styles.text}`}>
                  {CATEGORY_LABELS[category]}
                </h2>
                <span className="ml-auto hidden shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200/60 sm:inline">
                  {formatNumber(inCategory.length)}টি
                </span>
              </div>
              <div className="space-y-2.5 sm:space-y-3">
                {inCategory.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-center text-sm text-slate-500">
                    এই গ্রুপে আইটেম নেই
                  </p>
                )}
                {inCategory.map((option) => (
                  <SnackCard
                    key={option.snackItemId}
                    option={option}
                    isReceiving={option.snackItemId === receivingId}
                    canChange={canChange}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {canChange && hasOwnChoice && <ResetButton />}
    </form>
  );
}

function SnackCard({
  option,
  isReceiving,
  canChange,
}: {
  option: Option;
  isReceiving: boolean;
  canChange: boolean;
}) {
  const { pending, data } = useFormStatus();
  // সেভ হওয়ার আগেই ট্যাপ করা কার্ডটা হাইলাইট দেখাই
  const pendingChoice = pending ? data?.get("choice") : null;
  const highlighted = pendingChoice ? pendingChoice === String(option.snackItemId) : isReceiving;
  const styles = CATEGORY_STYLES[option.category];
  const placeholder = styles.placeholders[option.snackItemId % styles.placeholders.length];

  return (
    <button
      type="submit"
      name="choice"
      value={option.snackItemId}
      disabled={!canChange || pending}
      aria-pressed={highlighted}
      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition duration-200 sm:flex-row ${
        highlighted
          ? styles.selected
          : "border-slate-200/80 enabled:hover:-translate-y-0.5 enabled:hover:border-slate-300 enabled:hover:shadow-lift"
      } ${canChange ? "cursor-pointer" : "cursor-default"} ${pending && !highlighted ? "opacity-60" : ""}`}
    >
      {option.imageUrl ? (
        <Image
          src={option.imageUrl}
          alt={option.name}
          width={320}
          height={240}
          unoptimized
          className="aspect-4/3 w-full shrink-0 bg-slate-100 object-cover sm:aspect-square sm:w-28"
        />
      ) : (
        <span
          className={`relative flex aspect-4/3 w-full shrink-0 items-center justify-center overflow-hidden bg-linear-to-br sm:aspect-square sm:w-28 ${placeholder}`}
        >
          <span className="absolute -top-5 -left-5 size-16 rounded-full bg-white/50" />
          <span className="absolute -right-4 -bottom-6 size-14 rounded-full bg-white/40" />
          <CategoryIcon
            category={option.category}
            className={`relative size-10 transition duration-300 ${canChange ? "group-hover:scale-110 group-hover:-rotate-6" : ""}`}
          />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1 p-3 sm:p-4">
        <span className="leading-snug font-semibold text-slate-900">{option.name}</span>
        {option.description && (
          <span className="line-clamp-2 text-xs text-slate-500">{option.description}</span>
        )}
        <span className="mt-auto flex flex-wrap items-center gap-1.5 pt-1.5">
          <span className="font-bold text-slate-900">{formatTaka(option.price)}</span>
          {option.isDefault && <DefaultBadge />}
        </span>
        {highlighted && <span className={`text-sm font-semibold ${styles.text}`}>আপনি পাবেন</span>}
      </span>
      {highlighted && (
        <span
          className={`absolute top-2 right-2 flex size-7 animate-pop items-center justify-center rounded-full text-white shadow-md ring-2 ring-white ${styles.dot}`}
        >
          <Icon name="check" className="size-4" />
        </span>
      )}
    </button>
  );
}

function ResetButton() {
  const { pending } = useFormStatus();
  return (
    <div className="flex justify-center">
      <button
        type="submit"
        name="choice"
        value="default"
        disabled={pending}
        className={`${buttonClass.secondary} w-full sm:w-auto`}
      >
        <Icon name="undo" className="size-4" />
        ডিফল্টে ফিরুন
      </button>
    </div>
  );
}
