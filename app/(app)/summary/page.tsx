import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "সারাংশ" };

export default async function SummaryPage() {
  await requireUser();
  return <ComingSoon title="আজকের সারাংশ" />;
}
