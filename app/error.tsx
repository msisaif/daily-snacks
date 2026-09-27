"use client";

import Link from "next/link";
import { useEffect } from "react";

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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-xl font-bold">কিছু একটা সমস্যা হয়েছে</h1>
      <p className="text-slate-600">
        একটু পরে আবার চেষ্টা করুন। বারবার হলে অ্যাডমিনকে জানান।
        {error.digest && <span className="block text-xs text-slate-400">কোড: {error.digest}</span>}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          আবার চেষ্টা করুন
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          হোমে ফিরুন
        </Link>
      </div>
    </main>
  );
}
