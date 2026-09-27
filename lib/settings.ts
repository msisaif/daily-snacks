import "server-only";

import { getDb } from "@/lib/db";

export type Settings = {
  budgetPerPerson: number;
  defaultCutoffTime: string;
};

export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  const result = await db.execute(
    "SELECT budget_per_person, default_cutoff_time FROM settings WHERE id = 1",
  );
  const row = result.rows[0];
  return {
    budgetPerPerson: Number(row.budget_per_person),
    defaultCutoffTime: String(row.default_cutoff_time),
  };
}
