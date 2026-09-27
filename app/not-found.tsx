import Link from "next/link";
import { linkButtonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl font-bold text-slate-300">৪০৪</p>
      <h1 className="text-xl font-bold">পেজটা পাওয়া যায়নি</h1>
      <p className="text-slate-600">লিংকটা ভুল, অথবা জিনিসটা আর নেই।</p>
      <Link href="/" className={linkButtonClass}>
        হোমে ফিরুন
      </Link>
    </main>
  );
}
