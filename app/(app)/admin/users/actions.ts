"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { firstErrorMessage, formText, formValues, type FormState } from "@/lib/form";
import { hashPassword, passwordSchema } from "@/lib/password";
import { categorySchema, employeeIdSchema, nameSchema, roleSchema } from "@/lib/validation";

const createUserSchema = z.object({
  employeeId: employeeIdSchema,
  name: nameSchema,
  password: passwordSchema,
  role: roleSchema,
  defaultCategory: categorySchema,
});

export async function createUser(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    employeeId: formText(formData, "employeeId"),
    name: formText(formData, "name"),
    password: formText(formData, "password"),
    role: formText(formData, "role"),
    defaultCategory: formText(formData, "defaultCategory"),
  });
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error), values: formValues(formData) };
  }
  const { employeeId, name, password, role, defaultCategory } = parsed.data;

  const db = await getDb();
  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE employee_id = ?",
    args: [employeeId],
  });
  if (existing.rows.length > 0) {
    return {
      error: `"${employeeId}" Employee ID আগে থেকেই আছে`,
      values: formValues(formData),
    };
  }

  const passwordHash = await hashPassword(password);
  await db.execute({
    sql: `INSERT INTO users (employee_id, name, password_hash, role, default_category, must_change_password)
          VALUES (?, ?, ?, ?, ?, 1)`,
    args: [employeeId, name, passwordHash, role, defaultCategory],
  });

  revalidatePath("/", "layout");
  redirect("/admin/users");
}

const updateUserSchema = z.object({
  name: nameSchema,
  role: roleSchema,
  defaultCategory: categorySchema,
});

export async function updateUser(
  userId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();

  const parsed = updateUserSchema.safeParse({
    name: formText(formData, "name"),
    role: formText(formData, "role"),
    defaultCategory: formText(formData, "defaultCategory"),
  });
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error), values: formValues(formData) };
  }
  const { name, role, defaultCategory } = parsed.data;

  // নিজের রোল বদলাতে না দিলে সবসময় অন্তত একজন সক্রিয় অ্যাডমিন থাকে
  if (userId === admin.id && role !== "admin") {
    return { error: "নিজেকে সদস্য বানাতে পারবেন না", values: formValues(formData) };
  }

  const db = await getDb();
  const result = await db.execute({
    sql: `UPDATE users SET name = ?, role = ?, default_category = ?, updated_at = ?
          WHERE id = ?`,
    args: [name, role, defaultCategory, new Date().toISOString(), userId],
  });
  if (result.rowsAffected === 0) return { error: "ইউজার পাওয়া যায়নি" };

  revalidatePath("/", "layout");
  return { success: "সেভ হয়েছে" };
}

export async function resetPassword(
  userId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    return { error: "নিজের পাসওয়ার্ড অ্যাকাউন্ট পেজ থেকে বদলান" };
  }

  const parsed = passwordSchema.safeParse(formText(formData, "password"));
  if (!parsed.success) return { error: firstErrorMessage(parsed.error) };

  const passwordHash = await hashPassword(parsed.data);
  const db = await getDb();
  const [updateResult] = await db.batch(
    [
      {
        sql: `UPDATE users SET password_hash = ?, must_change_password = 1, updated_at = ?
              WHERE id = ?`,
        args: [passwordHash, new Date().toISOString(), userId],
      },
      { sql: "DELETE FROM sessions WHERE user_id = ?", args: [userId] },
    ],
    "write",
  );
  if (updateResult.rowsAffected === 0) return { error: "ইউজার পাওয়া যায়নি" };

  revalidatePath("/", "layout");
  return {
    success: "পাসওয়ার্ড রিসেট হয়েছে। নতুন অস্থায়ী পাসওয়ার্ডটা ইউজারকে জানিয়ে দিন, প্রথম লগইনে তাকে এটা বদলাতে হবে।",
  };
}

export async function setUserActive(userId: number, active: boolean): Promise<FormState> {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    return { error: "নিজেকে নিষ্ক্রিয় করতে পারবেন না" };
  }

  const statements = [
    {
      sql: "UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?",
      args: [active ? 1 : 0, new Date().toISOString(), userId],
    },
  ];
  if (!active) {
    statements.push({ sql: "DELETE FROM sessions WHERE user_id = ?", args: [userId] });
  }

  const db = await getDb();
  const [updateResult] = await db.batch(statements, "write");
  if (updateResult.rowsAffected === 0) return { error: "ইউজার পাওয়া যায়নি" };

  revalidatePath("/", "layout");
  return { success: active ? "ইউজার সক্রিয় করা হয়েছে" : "ইউজার নিষ্ক্রিয় করা হয়েছে" };
}
