"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { FormMessage } from "@/components/form";
import { Badge, CATEGORY_STYLES, CategoryIcon } from "@/components/ui";
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
    <form action={formAction} className="space-y-4">
      <FormMessage error={state.error} />

      {/* CATEGORIES-এর ক্রম অনুযায়ী: হেলদি বাঁয়ে, আনহেলদি ডানে (মোবাইলেও) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {CATEGORIES.map((category) => {
          const inCategory = options.filter((option) => option.category === category);
          const styles = CATEGORY_STYLES[category];
          return (
            <div key={category} className={`rounded-2xl border p-2 sm:p-3 ${styles.panel}`}>
              <div className="mb-2 flex items-center gap-2 px-1 pt-1 sm:mb-3">
                <span className={`flex size-7 items-center justify-center rounded-lg ${styles.icon}`}>
                  <CategoryIcon category={category} />
                </span>
                <h2 className={`font-semibold ${styles.text}`}>{CATEGORY_LABELS[category]}</h2>
                <span className="ml-auto text-xs text-slate-500">
                  {formatNumber(inCategory.length)}টি
                </span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {inCategory.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-4 text-center text-sm text-slate-500">
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

  return (
    <button
      type="submit"
      name="choice"
      value={option.snackItemId}
      disabled={!canChange || pending}
      aria-pressed={highlighted}
      className={`flex w-full flex-col overflow-hidden rounded-xl border bg-white text-left shadow-sm transition sm:flex-row ${
        highlighted ? styles.selected : "border-slate-200 enabled:hover:border-slate-300 enabled:hover:shadow-md"
      } ${canChange ? "cursor-pointer" : "cursor-default"} ${pending && !highlighted ? "opacity-60" : ""}`}
    >
      {option.imageUrl ? (
        <Image
          src={option.imageUrl}
          alt={option.name}
          width={320}
          height={240}
          unoptimized
          className="aspect-4/3 w-full shrink-0 bg-slate-100 object-cover sm:aspect-square sm:w-24"
        />
      ) : (
        <span
          className={`flex aspect-4/3 w-full shrink-0 items-center justify-center sm:aspect-square sm:w-24 ${styles.icon}`}
        >
          <CategoryIcon category={option.category} className="size-8 opacity-70" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1 p-3">
        <span className="font-semibold leading-snug text-slate-900">{option.name}</span>
        {option.description && (
          <span className="line-clamp-2 text-xs text-slate-500">{option.description}</span>
        )}
        <span className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          <span className="font-bold tabular-nums">{formatTaka(option.price)}</span>
          {option.isDefault && <Badge>ডিফল্ট</Badge>}
        </span>
        {highlighted && (
          <span className={`text-sm font-semibold ${styles.text}`}>✓ আপনি পাবেন</span>
        )}
      </span>
    </button>
  );
}

function ResetButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="choice"
      value="default"
      disabled={pending}
      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-60"
    >
      ডিফল্টে ফিরুন
    </button>
  );
}
