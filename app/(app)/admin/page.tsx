import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "অ্যাডমিন" };

export default async function AdminPage() {
  await requireAdmin();
  return <ComingSoon title="অ্যাডমিন প্যানেল" />;
}
