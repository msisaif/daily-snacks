"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { firstErrorMessage, formText, formValues, type FormState } from "@/lib/form";
import { hashPassword, passwordSchema, verifyPassword } from "@/lib/password";
import { categorySchema, nameSchema } from "@/lib/validation";

// শুধু নাম আর ডিফল্ট গ্রুপ নেওয়া হয়; employee_id, role, is_active পাঠালেও উপেক্ষিত
const profileSchema = z.object({
  name: nameSchema,
  defaultCategory: categorySchema,
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    name: formText(formData, "name"),
    defaultCategory: formText(formData, "defaultCategory"),
  });
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error), values: formValues(formData) };
  }

  const db = await getDb();
  await db.execute({
    sql: "UPDATE users SET name = ?, default_category = ?, updated_at = ? WHERE id = ?",
    args: [parsed.data.name, parsed.data.defaultCategory, new Date().toISOString(), user.id],
  });

  revalidatePath("/", "layout");
  return { success: "প্রোফাইল সেভ হয়েছে" };
}

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "বর্তমান পাসওয়ার্ড দিন"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "নতুন পাসওয়ার্ড দুটো মিলছে না",
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    error: "নতুন পাসওয়ার্ড বর্তমানটার থেকে আলাদা হতে হবে",
  });

// requireUser() নয়: যাদের পাসওয়ার্ড বদলানো বাধ্যতামূলক, তারাও এখানে আসতে পারবে
export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formText(formData, "currentPassword"),
    newPassword: formText(formData, "newPassword"),
    confirmPassword: formText(formData, "confirmPassword"),
  });
  if (!parsed.success) return { error: firstErrorMessage(parsed.error) };

  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT password_hash FROM users WHERE id = ?",
    args: [user.id],
  });
  const currentOk = await verifyPassword(
    parsed.data.currentPassword,
    String(result.rows[0].password_hash),
  );
  if (!currentOk) return { error: "বর্তমান পাসওয়ার্ড ভুল" };

  const newHash = await hashPassword(parsed.data.newPassword);
  await db.batch(
    [
      {
        sql: `UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = ?
              WHERE id = ?`,
        args: [newHash, new Date().toISOString(), user.id],
      },
      // বর্তমান সেশনটা রেখে বাকি সব ডিভাইস থেকে লগআউট
      {
        sql: "DELETE FROM sessions WHERE user_id = ? AND id != ?",
        args: [user.id, user.sessionId],
      },
    ],
    "write",
  );

  if (user.mustChangePassword) redirect("/");
  return { success: "পাসওয়ার্ড বদলানো হয়েছে। অন্য সব ডিভাইস থেকে লগআউট করা হয়েছে।" };
}
