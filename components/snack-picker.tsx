"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { CATEGORY_STYLES, CategoryIcon, DefaultBadge, IconTile } from "@/components/ui";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants";
import { formatTaka } from "@/lib/format";

export type SnackPickerItem = {
  snackItemId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: Category;
  price: number;
  isDefault: boolean;
};

// বরাদ্দে "ডিফল্ট" কার্ড, যার value "default"
export type DefaultChoice = { note: string };

function ItemThumb({ item, className }: { item: SnackPickerItem; className: string }) {
  if (item.imageUrl) {
    return (
      <Image
        src={item.imageUrl}
        alt=""
        width={128}
        height={128}
        unoptimized
        className={`shrink-0 bg-slate-100 object-cover ${className}`}
      />
    );
  }
  const styles = CATEGORY_STYLES[item.category];
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-linear-to-br ${
        styles.placeholders[item.snackItemId % styles.placeholders.length]
      } ${className}`}
    >
      <CategoryIcon category={item.category} className="size-1/2" />
    </span>
  );
}

function DefaultThumb({ className }: { className: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-linear-to-br from-amber-100 to-yellow-50 text-amber-500 ${className}`}
    >
      <Icon name="star" className="size-1/2" />
    </span>
  );
}

// ডান পাশের গোল দাগ: বাছাই হলে রঙিন আর টিক
function Tick({ selected, color }: { selected: boolean; color: string }) {
  return (
    <span
      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-white transition ${
        selected ? `${color} animate-pop shadow-md` : "border-2 border-slate-200 group-hover:border-slate-300"
      }`}
    >
      {selected && <Icon name="check" className="size-3.5" />}
    </span>
  );
}

const CARD_BASE =
  "group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500";

function ItemCard({ item, selected, onSelect }: { item: SnackPickerItem; selected: boolean; onSelect: () => void }) {
  const styles = CATEGORY_STYLES[item.category];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`${CARD_BASE} bg-white ${selected ? styles.selected : "border-slate-200/80 hover:border-slate-300"}`}
    >
      <ItemThumb item={item} className="size-16 rounded-xl" />
      <span className="min-w-0 flex-1">
        <span className="block leading-snug font-semibold text-slate-900">{item.name}</span>
        {item.description && (
          <span className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.description}</span>
        )}
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-slate-900">{formatTaka(item.price)}</span>
          {item.isDefault && <DefaultBadge />}
        </span>
      </span>
      <Tick selected={selected} color={styles.dot} />
    </button>
  );
}

type DialogProps = {
  open: boolean;
  onClose: () => void;
  items: SnackPickerItem[];
  value?: string;
  onSelect: (value: string) => void;
  title: string;
  subtitle?: string;
  defaultChoice?: DefaultChoice;
};

// ব্রাউজারের নিজস্ব <dialog>: Esc-এ বন্ধ হয়, ফোকাস ভেতরেই থাকে; পেছনের ঝাপসা অংশে ক্লিক করলেও বন্ধ
export function SnackDialog({ open, onClose, items, value, onSelect, title, subtitle, defaultChoice }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const groups = CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto max-h-[min(88dvh,46rem)] w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-3xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm open:flex open:animate-rise open:flex-col"
    >
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <IconTile icon="cookie" tone="orange" size="sm" />
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-display text-lg leading-tight font-bold">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="-m-1 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <Icon name="x" className="size-5" />
        </button>
      </div>

      <div className="min-h-0 space-y-4 overflow-y-auto p-4 sm:p-6">
        {defaultChoice && (
          <button
            type="button"
            onClick={() => onSelect("default")}
            aria-pressed={value === "default"}
            className={`${CARD_BASE} ${
              value === "default"
                ? "border-amber-400 bg-amber-50/70 ring-2 ring-amber-400/50"
                : "border-slate-200/80 bg-white hover:border-slate-300"
            }`}
          >
            <DefaultThumb className="size-16 rounded-xl" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-slate-900">ডিফল্ট</span>
              <span className="mt-0.5 block text-xs text-slate-500">{defaultChoice.note}</span>
            </span>
            <Tick selected={value === "default"} color="bg-amber-500" />
          </button>
        )}

        {groups.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            দেখানোর মতো কোনো আইটেম নেই।
          </p>
        ) : (
          <div className={`grid gap-4 ${groups.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {groups.map((group) => {
              const styles = CATEGORY_STYLES[group.category];
              return (
                <section key={group.category} className={`min-w-0 rounded-3xl border p-3 ${styles.panel}`}>
                  <h3 className="mb-3 flex items-center gap-2.5 px-1 pt-1">
                    <IconTile icon={styles.icon} tone={styles.tone} size="sm" />
                    <span className={`font-display text-base leading-tight font-bold ${styles.text}`}>
                      {CATEGORY_LABELS[group.category]}
                    </span>
                  </h3>
                  {/* একটাই গ্রুপ হলে জায়গা বেশি, তাই কার্ড দুই কলামে */}
                  <div className={groups.length === 1 ? "grid gap-2.5 sm:grid-cols-2" : "space-y-2.5"}>
                    {group.items.map((item) => (
                      <ItemCard
                        key={item.snackItemId}
                        item={item}
                        selected={value === String(item.snackItemId)}
                        onSelect={() => onSelect(String(item.snackItemId))}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </dialog>
  );
}

type FieldProps = {
  items: SnackPickerItem[];
  title: string;
  subtitle?: string;
  defaultChoice?: DefaultChoice;
  name?: string; // দিলে ফর্মে hidden input হিসেবে যায়
  value?: string; // দিলে বাইরে থেকে নিয়ন্ত্রিত, নইলে নিজের state
  onChange?: (value: string) => void;
  highlight?: boolean;
  disabled?: boolean;
};

// ফর্মের ঘরের মতো বাটন: বাছাই করা আইটেম দেখায়, চাপলে modal খোলে
export function SnackField({
  items,
  title,
  subtitle,
  defaultChoice,
  name,
  value,
  onChange,
  highlight = false,
  disabled = false,
}: FieldProps) {
  const [open, setOpen] = useState(false);
  const [ownValue, setOwnValue] = useState("");
  const selected = value ?? ownValue;
  const item = items.find((option) => String(option.snackItemId) === selected);
  const showDefault = selected === "default" && defaultChoice !== undefined;

  function select(choice: string) {
    setOwnValue(choice);
    setOpen(false);
    onChange?.(choice);
  }

  return (
    <>
      {name && <input type="hidden" name={name} value={selected} />}
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        aria-haspopup="dialog"
        className={`flex w-full items-center gap-3 rounded-xl border p-1.5 pr-3 text-left shadow-xs transition hover:border-slate-300 focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/15 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 ${
          highlight ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-white"
        }`}
      >
        {showDefault ? (
          <DefaultThumb className="size-9 rounded-lg" />
        ) : item ? (
          <ItemThumb item={item} className="size-9 rounded-lg" />
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400">
            <Icon name="plus" className="size-4" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          {showDefault ? (
            <>
              <span className="block truncate text-sm font-medium text-slate-900">ডিফল্ট</span>
              <span className="block truncate text-xs text-slate-500">{defaultChoice.note}</span>
            </>
          ) : item ? (
            <>
              <span className="block truncate text-sm font-medium text-slate-900">{item.name}</span>
              <span className="block truncate text-xs text-slate-500">{formatTaka(item.price)}</span>
            </>
          ) : (
            <span className="block truncate text-sm text-slate-400">আইটেম বাছাই করুন</span>
          )}
        </span>
        <Icon name="chevron-right" className="size-4 shrink-0 text-slate-400" />
      </button>
      <SnackDialog
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        value={selected}
        onSelect={select}
        title={title}
        subtitle={subtitle}
        defaultChoice={defaultChoice}
      />
    </>
  );
}
