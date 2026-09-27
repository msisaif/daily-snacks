import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "ইতিহাস" };

export default async function HistoryPage() {
  await requireUser();
  return <ComingSoon title="আগের মেনুগুলো" />;
}
