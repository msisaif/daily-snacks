import { ComingSoon } from "@/components/coming-soon";
import { requireUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await requireUser();

  return (
    <div className="space-y-4">
      <p className="text-lg">স্বাগতম, {user.name}!</p>
      <ComingSoon title="আজকের মেনু" />
    </div>
  );
}
