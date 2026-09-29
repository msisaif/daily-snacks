import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Avatar, Badge, buttonClass, cardClass, CardTitle, CategoryBadge, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "অ্যাকাউন্ট" };

const INSTALL_STEPS = [
  { device: "Android", text: "Chrome-এর ⋮ মেনু থেকে “Install app” বা “Add to Home screen” চাপুন।" },
  { device: "iPhone", text: "Safari-র Share বাটন থেকে “Add to Home Screen” চাপুন।" },
  { device: "কম্পিউটার", text: "Chrome বা Edge-এর অ্যাড্রেস বারে ইনস্টল আইকনে ক্লিক করুন।" },
];

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="আমার অ্যাকাউন্ট"
        description="নাম আর ডিফল্ট গ্রুপ এখান থেকে বদলান।"
        icon="user"
        tone="rose"
      />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <aside className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-card">
          <div className="h-24 bg-linear-to-br from-emerald-400 via-teal-500 to-sky-500" />
          <div className="-mt-10 flex flex-col items-center px-5 pb-6 text-center">
            <Avatar name={user.name} className="size-20 text-3xl ring-4 ring-white" />
            <p className="mt-3 font-display text-xl font-bold text-slate-900">{user.name}</p>
            <p className="text-sm text-slate-500">Employee ID · {user.employeeId}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              <Badge tone={user.role === "admin" ? "violet" : "gray"}>{ROLE_LABELS[user.role]}</Badge>
              <CategoryBadge category={user.defaultCategory} />
            </div>
            <Link href="/account/password" className={`${buttonClass.secondary} mt-6 w-full`}>
              <Icon name="lock" className="size-4" />
              পাসওয়ার্ড বদলান
            </Link>
          </div>
        </aside>

        <div className="space-y-6 lg:col-span-2">
          <section className={cardClass}>
            <CardTitle
              title="প্রোফাইল"
              description="কোনো দিন কিছু না বাছলে ডিফল্ট গ্রুপের ডিফল্ট আইটেমটা পাবেন।"
              icon="sliders"
              tone="emerald"
            />
            <ProfileForm name={user.name} defaultCategory={user.defaultCategory} />
          </section>

          {/* অ্যাপ হিসেবে খোলা থাকলে এই কার্ড লাগে না */}
          <section className={`${cardClass} standalone:hidden`}>
            <CardTitle
              title="ফোনে অ্যাপ হিসেবে রাখুন"
              description="ইনস্টল করলে হোম স্ক্রিন থেকে এক ট্যাপে খুলবে, আলাদা অ্যাপের মতো।"
              icon="smartphone"
              tone="violet"
            />
            <ul className="grid gap-3 text-sm sm:grid-cols-3">
              {INSTALL_STEPS.map((step) => (
                <li key={step.device} className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4">
                  <p className="font-semibold text-slate-900">{step.device}</p>
                  <p className="mt-1 text-slate-600">{step.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
