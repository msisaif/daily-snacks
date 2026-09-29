import Link from "next/link";
import { Icon } from "@/components/icons";
import { buttonClass, containerClass, LogoMark } from "@/components/ui";

export default function NotFound() {
  return (
    <main className={`${containerClass} stagger flex min-h-screen flex-col items-center justify-center gap-4 py-16 text-center`}>
      <LogoMark className="size-16 -rotate-12 animate-float" />
      <p className="bg-linear-to-br from-emerald-500 via-teal-500 to-orange-400 bg-clip-text font-display text-7xl font-bold text-transparent">
        ৪০৪
      </p>
      <h1 className="font-display text-2xl font-bold text-slate-900">পেজটা পাওয়া যায়নি</h1>
      <p className="text-slate-600">লিংকটা ভুল, অথবা জিনিসটা আর নেই।</p>
      <Link href="/" className={buttonClass.primary}>
        <Icon name="arrow-left" className="size-4" />
        হোমে ফিরুন
      </Link>
    </main>
  );
}
