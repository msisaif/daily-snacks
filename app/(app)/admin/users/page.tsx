import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Avatar, Badge, buttonClass, CategoryBadge, PageHeader } from "@/components/ui";
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
    <div className="stagger space-y-6">
      <PageHeader
        title="ইউজার"
        description={`সক্রিয় ${formatNumber(activeCount)} জন, মোট ${formatNumber(users.length)} জন`}
        icon="users"
        tone="sky"
        action={
          <Link href="/admin/users/new" className={buttonClass.primary}>
            <Icon name="plus" className="size-4" />
            নতুন ইউজার
          </Link>
        }
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <li key={user.id}>
            <Link
              href={`/admin/users/${user.id}`}
              className={`group flex h-full items-center gap-3.5 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift ${
                user.isActive ? "" : "opacity-60 grayscale"
              }`}
            >
              <Avatar name={user.name} className="size-12 text-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">
                  {user.name}
                  {user.id === admin.id && <span className="font-normal text-slate-500"> (আপনি)</span>}
                </p>
                <p className="text-sm text-slate-500">{user.employeeId}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {user.role === "admin" && <Badge tone="violet">অ্যাডমিন</Badge>}
                  <CategoryBadge category={user.defaultCategory} />
                  {!user.isActive && <Badge>নিষ্ক্রিয়</Badge>}
                  {user.isActive && user.mustChangePassword && (
                    <Badge tone="amber">পাসওয়ার্ড বদলানো বাকি</Badge>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
