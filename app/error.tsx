"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/icons";
import { buttonClass, containerClass, IconTile } from "@/components/ui";

// Error boundary অবশ্যই client component হতে হয়
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={`${containerClass} stagger flex min-h-screen flex-col items-center justify-center gap-4 py-16 text-center`}>
      <IconTile icon="alert" tone="rose" size="lg" />
      <h1 className="font-display text-2xl font-bold text-slate-900">কিছু একটা সমস্যা হয়েছে</h1>
      <p className="text-slate-600">
        একটু পরে আবার চেষ্টা করুন। বারবার হলে অ্যাডমিনকে জানান।
        {error.digest && <span className="mt-1 block text-xs text-slate-400">কোড: {error.digest}</span>}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => retry()} className={buttonClass.primary}>
          <Icon name="undo" className="size-4" />
          আবার চেষ্টা করুন
        </button>
        <Link href="/" className={buttonClass.secondary}>
          হোমে ফিরুন
        </Link>
      </div>
    </main>
  );
}
