"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatTaka } from "@/lib/format";
import { firstErrorMessage, formText, formValues, type FormState } from "@/lib/form";

const settingsSchema = z.object({
  budgetPerPerson: z.coerce
    .number({ error: "বাজেট সংখ্যায় লিখুন" })
    .positive("বাজেট ০-এর বেশি হতে হবে")
    .max(100000, "বাজেট অনেক বেশি"),
  defaultCutoffTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "কাটঅফ সময় HH:MM ফরম্যাটে দিন (যেমন 16:00)"),
});

export async function updateSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    budgetPerPerson: formText(formData, "budgetPerPerson"),
    defaultCutoffTime: formText(formData, "defaultCutoffTime"),
  });
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error), values: formValues(formData) };
  }
  const { budgetPerPerson, defaultCutoffTime } = parsed.data;

  // কোনো আইটেমের দাম (সক্রিয় বা নিষ্ক্রিয়) কখনো বাজেটের বেশি হবে না
  const db = await getDb();
  const tooExpensive = await db.execute({
    sql: "SELECT name, price FROM snack_items WHERE price > ? ORDER BY price DESC",
    args: [budgetPerPerson],
  });
  if (tooExpensive.rows.length > 0) {
    const items = tooExpensive.rows
      .map((row) => `${row.name} (${formatTaka(Number(row.price))})`)
      .join(", ");
    return {
      error: `এই আইটেমগুলোর দাম নতুন বাজেটের বেশি: ${items}। আগে এগুলোর দাম কমান।`,
      values: formValues(formData),
    };
  }

  await db.execute({
    sql: "UPDATE settings SET budget_per_person = ?, default_cutoff_time = ? WHERE id = 1",
    args: [budgetPerPerson, defaultCutoffTime],
  });

  revalidatePath("/", "layout");
  return { success: "সেটিংস সেভ হয়েছে" };
}
