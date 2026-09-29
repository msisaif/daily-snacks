"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { formatDuration } from "@/lib/format";

const URGENT_MS = 15 * 60 * 1000;

type Props = {
  cutoffAt: string;
  // সার্ভারে ফরম্যাট করা লেখা, যাতে ব্রাউজার আর সার্ভারের তারিখ-ফরম্যাট না মিললেও hydration ঠিক থাকে
  cutoffLabel: string;
};

export function Countdown({ cutoffAt, cutoffLabel }: Props) {
  const router = useRouter();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const cutoff = new Date(cutoffAt).getTime();
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      // কাটঅফ পার হলে পেজ রিফ্রেশ, সার্ভার তখন মেনু বন্ধ করে দেবে
      if (current >= cutoff) {
        clearInterval(timer);
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [cutoffAt, router]);

  const remaining = now === null ? null : new Date(cutoffAt).getTime() - now;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="inline-flex items-center gap-1.5 text-slate-500">
        <Icon name="clock" className="size-4" />
        কাটঅফ <span className="font-medium text-slate-700">{cutoffLabel}</span>
      </span>
      {remaining !== null &&
        (remaining > 0 ? (
          <span
            className={`inline-flex animate-pop items-center gap-2 rounded-full px-3 py-1 font-semibold tabular-nums ring-1 ring-inset ${
              remaining < URGENT_MS
                ? "bg-rose-50 text-rose-700 ring-rose-600/20"
                : "bg-amber-50 text-amber-800 ring-amber-600/20"
            }`}
          >
            <span className="size-2 animate-pulse rounded-full bg-current" />
            বাকি {formatDuration(remaining)}
          </span>
        ) : (
          <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700 ring-1 ring-rose-600/20 ring-inset">
            সময় শেষ
          </span>
        ))}
    </div>
  );
}
