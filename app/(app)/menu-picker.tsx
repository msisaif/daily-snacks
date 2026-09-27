"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { FormMessage } from "@/components/form";
import { Badge } from "@/components/ui";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants";
import { formatTaka } from "@/lib/format";
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

      {CATEGORIES.map((category) => {
        const inCategory = options.filter((option) => option.category === category);
        if (inCategory.length === 0) return null;
        return (
          <div key={category}>
            <h2 className="mb-2 font-semibold">{CATEGORY_LABELS[category]}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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

  return (
    <button
      type="submit"
      name="choice"
      value={option.snackItemId}
      disabled={!canChange || pending}
      aria-pressed={highlighted}
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white text-left transition ${
        highlighted
          ? "border-emerald-600 ring-2 ring-emerald-600"
          : "border-slate-200 enabled:hover:border-emerald-300"
      } ${canChange ? "cursor-pointer" : "cursor-default"} ${pending && !highlighted ? "opacity-60" : ""}`}
    >
      {option.imageUrl && (
        <Image
          src={option.imageUrl}
          alt={option.name}
          width={320}
          height={240}
          unoptimized
          className="aspect-[4/3] w-full bg-slate-100 object-cover"
        />
      )}
      <span className="flex flex-1 flex-col gap-1 p-3">
        <span className="font-medium leading-snug">{option.name}</span>
        {option.description && (
          <span className="text-xs text-slate-500">{option.description}</span>
        )}
        <span className="mt-auto flex flex-wrap items-center justify-between gap-1 pt-1">
          <span className="font-semibold">{formatTaka(option.price)}</span>
          {option.isDefault && <Badge>ডিফল্ট</Badge>}
        </span>
        {highlighted && (
          <span className="text-sm font-medium text-emerald-700">✓ আপনি পাবেন</span>
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
      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-100 disabled:opacity-60"
    >
      ডিফল্টে ফিরুন
    </button>
  );
}
