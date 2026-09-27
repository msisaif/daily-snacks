import type { Metadata } from "next";
import Link from "next/link";
import { Badge, CategoryBadge, linkButtonClass, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import type { Category, Role } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "ইউজার" };

export default async function UsersPage() {
  const admin = await requireAdmin();

  const db = await getDb();
  const result = await db.execute(
    `SELECT id, employee_id, name, role, default_category, is_active, must_change_password
     FROM users
     ORDER BY is_active DESC, name COLLATE NOCASE`,
  );
  const users = result.rows.map((row) => ({
    id: Number(row.id),
    employeeId: String(row.employee_id),
    name: String(row.name),
    role: row.role as Role,
    defaultCategory: row.default_category as Category,
    isActive: Number(row.is_active) === 1,
    mustChangePassword: Number(row.must_change_password) === 1,
  }));
  const activeCount = users.filter((user) => user.isActive).length;

  return (
    <div>
      <PageHeader
        title={`ইউজার (সক্রিয় ${formatNumber(activeCount)} জন)`}
        action={
          <Link href="/admin/users/new" className={linkButtonClass}>
            + নতুন ইউজার
          </Link>
        }
      />

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {users.map((user) => (
          <li key={user.id}>
            <Link
              href={`/admin/users/${user.id}`}
              className={`flex items-center justify-between gap-3 p-3 hover:bg-slate-50 ${
                user.isActive ? "" : "opacity-60"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {user.name}
                  {user.id === admin.id && <span className="text-slate-500"> (আপনি)</span>}
                </p>
                <p className="text-sm text-slate-500">{user.employeeId}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                {user.role === "admin" && <Badge tone="blue">অ্যাডমিন</Badge>}
                <CategoryBadge category={user.defaultCategory} />
                {!user.isActive && <Badge>নিষ্ক্রিয়</Badge>}
                {user.isActive && user.mustChangePassword && (
                  <Badge tone="amber">পাসওয়ার্ড বদলানো বাকি</Badge>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
