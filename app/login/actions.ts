"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, deleteCurrentSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { firstErrorMessage, formText } from "@/lib/form";
import { verifyPassword } from "@/lib/password";

export type LoginState = {
  error?: string;
  employeeId?: string;
};

const loginSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID দিন"),
  password: z.string().min(1, "পাসওয়ার্ড দিন"),
});

const LOGIN_ERROR = "Employee ID বা পাসওয়ার্ড ভুল";

// Employee ID না থাকলেও একই পরিমাণ সময় লাগবে, যাতে কোন ID আছে তা বোঝা না যায়
const DUMMY_HASH = "$2b$10$2cTDPXZC9T4lU8ofuzisy.1rVYJ9adcyVYpTfHRopufSC0fktu9Ke";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const employeeId = formText(formData, "employeeId");
  const parsed = loginSchema.safeParse({
    employeeId,
    password: formText(formData, "password"),
  });
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error), employeeId };
  }

  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT id, password_hash, is_active, must_change_password FROM users WHERE employee_id = ?",
    args: [parsed.data.employeeId],
  });
  const user = result.rows[0];

  const passwordOk = await verifyPassword(
    parsed.data.password,
    user ? String(user.password_hash) : DUMMY_HASH,
  );
  if (!user || !passwordOk || Number(user.is_active) !== 1) {
    return { error: LOGIN_ERROR, employeeId };
  }

  await createSession(Number(user.id));
  redirect(Number(user.must_change_password) === 1 ? "/account/password" : "/");
}

// লগআউটে requireUser() নেই: পাসওয়ার্ড বদলাতে বাধ্য ইউজারও যেন লগআউট করতে পারে
export async function logout(): Promise<void> {
  await deleteCurrentSession();
  redirect("/login");
}
