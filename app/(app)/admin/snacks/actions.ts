"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatTaka } from "@/lib/format";
import { firstErrorMessage, formText, formValues, type FormState } from "@/lib/form";
import { getSettings } from "@/lib/settings";
import { categorySchema } from "@/lib/validation";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const snackSchema = z.object({
  name: z.string().trim().min(1, "নাম দিন").max(100, "নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে"),
  description: z.string().trim().max(300, "বিবরণ সর্বোচ্চ ৩০০ অক্ষরের হতে পারে"),
  price: z.coerce.number({ error: "দাম সংখ্যায় লিখুন" }).positive("দাম ০-এর বেশি হতে হবে"),
  category: categorySchema,
  imageUrl: z
    .string()
    .trim()
    .max(500, "ছবির লিংক সর্বোচ্চ ৫০০ অক্ষরের হতে পারে")
    .refine((value) => value === "" || isHttpUrl(value), "ছবির লিংক http:// বা https:// দিয়ে শুরু হতে হবে"),
});

type SnackInput = z.infer<typeof snackSchema>;

async function validateSnack(formData: FormData): Promise<{ error: string } | { data: SnackInput }> {
  const parsed = snackSchema.safeParse({
    name: formText(formData, "name"),
    description: formText(formData, "description"),
    price: formText(formData, "price"),
    category: formText(formData, "category"),
    imageUrl: formText(formData, "imageUrl"),
  });
  if (!parsed.success) return { error: firstErrorMessage(parsed.error) };

  const { budgetPerPerson } = await getSettings();
  if (parsed.data.price > budgetPerPerson) {
    return { error: `দাম জনপ্রতি বাজেটের (${formatTaka(budgetPerPerson)}) বেশি হতে পারবে না` };
  }
  return { data: parsed.data };
}

export async function createSnack(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const result = await validateSnack(formData);
  if ("error" in result) return { error: result.error, values: formValues(formData) };
  const snack = result.data;

  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO snack_items (name, description, price, category, image_url)
          VALUES (?, ?, ?, ?, ?)`,
    args: [snack.name, snack.description || null, snack.price, snack.category, snack.imageUrl || null],
  });

  revalidatePath("/", "layout");
  redirect("/admin/snacks");
}

export async function updateSnack(
  snackId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const result = await validateSnack(formData);
  if ("error" in result) return { error: result.error, values: formValues(formData) };
  const snack = result.data;
  const isActive = formData.get("isActive") === "on";

  // এটা শুধু আইটেম তালিকা বদলায়; আগে খোলা মেনুতে দাম/গ্রুপের snapshot আলাদা থাকে
  const db = await getDb();
  const updateResult = await db.execute({
    sql: `UPDATE snack_items
          SET name = ?, description = ?, price = ?, category = ?, image_url = ?, is_active = ?
          WHERE id = ?`,
    args: [
      snack.name,
      snack.description || null,
      snack.price,
      snack.category,
      snack.imageUrl || null,
      isActive ? 1 : 0,
      snackId,
    ],
  });
  if (updateResult.rowsAffected === 0) return { error: "আইটেম পাওয়া যায়নি" };

  revalidatePath("/", "layout");
  return { success: "সেভ হয়েছে" };
}
