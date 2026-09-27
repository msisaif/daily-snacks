import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import type { Category, Role } from "@/lib/constants";

// proxy.ts-এও এই নামটা ব্যবহার হয়
const SESSION_COOKIE = "session";
const SESSION_DAYS = 30;

export type CurrentUser = {
  id: number;
  employeeId: string;
  name: string;
  role: Role;
  defaultCategory: Category;
  mustChangePassword: boolean;
  sessionId: string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  const db = await getDb();
  await db.batch(
    [
      {
        sql: "DELETE FROM sessions WHERE expires_at <= ?",
        args: [now.toISOString()],
      },
      {
        sql: "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
        args: [hashToken(token), userId, expiresAt.toISOString()],
      },
    ],
    "write",
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const db = await getDb();
    await db.execute({
      sql: "DELETE FROM sessions WHERE id = ?",
      args: [hashToken(token)],
    });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const sessionId = hashToken(token);
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT u.id, u.employee_id, u.name, u.role, u.default_category, u.must_change_password
          FROM sessions s
          JOIN users u ON u.id = s.user_id
          WHERE s.id = ? AND s.expires_at > ? AND u.is_active = 1`,
    args: [sessionId, new Date().toISOString()],
  });

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: Number(row.id),
    employeeId: String(row.employee_id),
    name: String(row.name),
    role: row.role as Role,
    defaultCategory: row.default_category as Category,
    mustChangePassword: Number(row.must_change_password) === 1,
    sessionId,
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/account/password");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
