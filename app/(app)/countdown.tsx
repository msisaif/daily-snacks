"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/format";

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
    <p className="text-sm text-slate-600">
      কাটঅফ: <span className="font-medium">{cutoffLabel}</span>
      {remaining !== null &&
        (remaining > 0 ? (
          <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">
            বাকি {formatDuration(remaining)}
          </span>
        ) : (
          <span className="ml-2 text-red-600">সময় শেষ</span>
        ))}
    </p>
  );
}
