import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/action-button";
import { Badge, cardClass, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import type { Category, Role } from "@/lib/constants";
import { getDb } from "@/lib/db";
import { parseId } from "@/lib/validation";
import { resetPassword, setUserActive, updateUser } from "../actions";
import { EditUserForm, ResetPasswordForm } from "../user-forms";

export const metadata: Metadata = { title: "ইউজার এডিট" };

export default async function EditUserPage({ params }: PageProps<"/admin/users/[id]">) {
  const admin = await requireAdmin();
  const userId = parseId((await params).id);
  if (!userId) notFound();

  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT employee_id, name, role, default_category, is_active, must_change_password
          FROM users WHERE id = ?`,
    args: [userId],
  });
  const row = result.rows[0];
  if (!row) notFound();

  const user = {
    employeeId: String(row.employee_id),
    name: String(row.name),
    role: row.role as Role,
    defaultCategory: row.default_category as Category,
    isActive: Number(row.is_active) === 1,
    mustChangePassword: Number(row.must_change_password) === 1,
  };
  const isSelf = userId === admin.id;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <PageHeader title={user.name} backHref="/admin/users" />

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-500">Employee ID:</span>
        <span className="font-medium">{user.employeeId}</span>
        {user.isActive ? <Badge tone="green">সক্রিয়</Badge> : <Badge>নিষ্ক্রিয়</Badge>}
        {user.isActive && user.mustChangePassword && (
          <Badge tone="amber">পাসওয়ার্ড বদলানো বাকি</Badge>
        )}
      </div>

      <section className={cardClass}>
        <h2 className="mb-3 font-semibold">তথ্য</h2>
        <EditUserForm
          action={updateUser.bind(null, userId)}
          name={user.name}
          role={user.role}
          defaultCategory={user.defaultCategory}
          isSelf={isSelf}
        />
      </section>

      {isSelf ? (
        <p className={`${cardClass} text-sm text-slate-600`}>
          নিজের পাসওয়ার্ড{" "}
          <Link href="/account/password" className="text-emerald-700 underline">
            অ্যাকাউন্ট পেজ
          </Link>{" "}
          থেকে বদলান। নিজেকে নিষ্ক্রিয় করা যায় না।
        </p>
      ) : (
        <>
          <section className={cardClass}>
            <h2 className="mb-1 font-semibold">পাসওয়ার্ড রিসেট</h2>
            <p className="mb-3 text-xs text-slate-500">
              রিসেট করলে ইউজার সব ডিভাইস থেকে লগআউট হবে।
            </p>
            <ResetPasswordForm action={resetPassword.bind(null, userId)} />
          </section>

          <section className={cardClass}>
            <h2 className="mb-1 font-semibold">অবস্থা</h2>
            {user.isActive ? (
              <>
                <p className="mb-3 text-xs text-slate-500">
                  নিষ্ক্রিয় ইউজার লগইন করতে পারবে না, আর মেনুর হিসাবে গোনা হবে না।
                </p>
                <ActionButton
                  action={setUserActive.bind(null, userId, false)}
                  variant="danger"
                  confirmMessage={`${user.name}-কে নিষ্ক্রিয় করবেন?`}
                >
                  নিষ্ক্রিয় করুন
                </ActionButton>
              </>
            ) : (
              <ActionButton action={setUserActive.bind(null, userId, true)} variant="primary">
                সক্রিয় করুন
              </ActionButton>
            )}
          </section>
        </>
      )}
    </div>
  );
}
