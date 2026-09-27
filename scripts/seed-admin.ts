import { z } from "zod";
import { getDb } from "../lib/db.ts";
import { hashPassword, passwordSchema } from "../lib/password.ts";

const adminEnvSchema = z.object({
  ADMIN_EMPLOYEE_ID: z.string().trim().min(1, "ADMIN_EMPLOYEE_ID সেট করা নেই"),
  ADMIN_NAME: z.string().trim().min(1, "ADMIN_NAME সেট করা নেই"),
  ADMIN_PASSWORD: passwordSchema,
});

async function main() {
  const db = await getDb();

  try {
    const existing = await db.execute(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'admin'",
    );
    if (Number(existing.rows[0].count) > 0) {
      console.log("অ্যাডমিন আগে থেকেই আছে — কিছু করা হয়নি।");
      return;
    }

    const parsed = adminEnvSchema.safeParse({
      ADMIN_EMPLOYEE_ID: process.env.ADMIN_EMPLOYEE_ID ?? "",
      ADMIN_NAME: process.env.ADMIN_NAME ?? "",
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "",
    });
    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => issue.message);
      throw new Error(`env ঠিক নেই:\n- ${messages.join("\n- ")}`);
    }

    const { ADMIN_EMPLOYEE_ID, ADMIN_NAME, ADMIN_PASSWORD } = parsed.data;
    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    await db.execute({
      sql: `INSERT INTO users (employee_id, name, password_hash, role, must_change_password)
            VALUES (?, ?, ?, 'admin', 1)`,
      args: [ADMIN_EMPLOYEE_ID, ADMIN_NAME, passwordHash],
    });

    console.log(`অ্যাডমিন তৈরি হয়েছে: ${ADMIN_EMPLOYEE_ID} (${ADMIN_NAME})`);
    console.log("প্রথম লগইনের পর পাসওয়ার্ড বদলাতে হবে।");
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
