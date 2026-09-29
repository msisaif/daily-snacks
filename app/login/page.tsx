import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { IconName } from "@/components/icons";
import { containerClass, IconTile, LogoMark, type Tone } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { CATEGORY_SHORT_LABELS } from "@/lib/constants";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "লগইন" };

const FEATURES: { icon: IconName; tone: Tone; text: string }[] = [
  {
    icon: "salad",
    tone: "emerald",
    text: `প্রতিদিন ${CATEGORY_SHORT_LABELS.healthy} আর ${CATEGORY_SHORT_LABELS.unhealthy} মিলিয়ে ২–৩টা আইটেম`,
  },
  { icon: "clock", tone: "amber", text: "কাটঅফের আগে নিজেরটা বেছে নিন" },
  { icon: "star", tone: "orange", text: "না বাছলে নিজের ডিফল্ট গ্রুপের ডিফল্ট আইটেম" },
];

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="flex min-h-screen items-center py-12">
      <div className={`${containerClass} grid items-center gap-12 lg:grid-cols-2`}>
        <section className="stagger relative hidden lg:block">
          <div className="flex items-center gap-3">
            <LogoMark className="size-14" />
            <div>
              <p className="font-display text-2xl font-bold tracking-tight text-slate-900">ডেইলি স্ন্যাকস</p>
              <p className="text-sm font-medium text-slate-500">Medigene IT</p>
            </div>
          </div>
          <h1 className="mt-10 font-display text-6xl leading-tight font-bold tracking-tight text-slate-900">
            আজ কী{" "}
            <span className="bg-linear-to-r from-emerald-600 via-teal-500 to-orange-500 bg-clip-text text-transparent">
              খাবেন?
            </span>
          </h1>
          <p className="mt-3 max-w-md text-lg text-slate-600">
            Medigene IT বিভাগের দৈনিক নাস্তা, এক জায়গায়।
          </p>
          <ul className="mt-8 space-y-3">
            {FEATURES.map((feature) => (
              <li
                key={feature.text}
                className="flex w-fit items-center gap-3 rounded-2xl bg-white/70 p-2.5 pr-5 shadow-sm ring-1 ring-slate-200/60 backdrop-blur"
              >
                <IconTile icon={feature.icon} tone={feature.tone} size="sm" />
                <span className="font-medium text-slate-700">{feature.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="stagger mx-auto w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <LogoMark className="size-16" />
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900">ডেইলি স্ন্যাকস</h1>
            <p className="mt-1 text-sm text-slate-600">Medigene IT বিভাগের দৈনিক নাস্তা</p>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lift backdrop-blur sm:p-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">লগইন</h2>
            <p className="mt-1 mb-6 text-sm text-slate-500">Employee ID আর পাসওয়ার্ড দিয়ে ঢুকুন।</p>
            <LoginForm />
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            অ্যাকাউন্ট দরকার হলে অ্যাডমিনের সাথে যোগাযোগ করুন।
          </p>
        </section>
      </div>
    </main>
  );
}
