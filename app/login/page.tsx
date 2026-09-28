import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "লগইন" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <LogoMark />
        <h1 className="mt-3 text-2xl font-bold tracking-tight">ডেইলি স্ন্যাকস</h1>
        <p className="mt-1 text-sm text-slate-600">Medigene IT বিভাগের দৈনিক নাস্তা</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">
        অ্যাকাউন্ট দরকার হলে অ্যাডমিনের সাথে যোগাযোগ করুন।
      </p>
    </main>
  );
}
