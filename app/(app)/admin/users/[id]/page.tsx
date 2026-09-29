import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/action-button";
import { Badge, Callout, cardClass, CardTitle, PageHeader } from "@/components/ui";
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
    <div className="stagger space-y-6">
      <PageHeader
        title={user.name}
        description={`Employee ID · ${user.employeeId}`}
        icon="user"
        tone="sky"
        backHref="/admin/users"
        badge={
          <>
            {user.isActive ? <Badge tone="green">সক্রিয়</Badge> : <Badge>নিষ্ক্রিয়</Badge>}
            {user.isActive && user.mustChangePassword && <Badge tone="amber">পাসওয়ার্ড বদলানো বাকি</Badge>}
          </>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <section className={`${cardClass} lg:col-span-3`}>
          <CardTitle title="তথ্য" icon="user" tone="sky" />
          <EditUserForm
            action={updateUser.bind(null, userId)}
            name={user.name}
            role={user.role}
            defaultCategory={user.defaultCategory}
            isSelf={isSelf}
          />
        </section>

        <div className="space-y-6 lg:col-span-2">
          {isSelf ? (
            <Callout>
              নিজের পাসওয়ার্ড{" "}
              <Link href="/account/password" className="font-semibold underline underline-offset-2">
                অ্যাকাউন্ট পেজ
              </Link>{" "}
              থেকে বদলান। নিজেকে নিষ্ক্রিয় করা যায় না।
            </Callout>
          ) : (
            <>
              <section className={cardClass}>
                <CardTitle
                  title="পাসওয়ার্ড রিসেট"
                  description="রিসেট করলে ইউজার সব ডিভাইস থেকে লগআউট হবে।"
                  icon="lock"
                  tone="violet"
                />
                <ResetPasswordForm action={resetPassword.bind(null, userId)} />
              </section>

              <section className={cardClass}>
                <CardTitle
                  title="অবস্থা"
                  description={
                    user.isActive
                      ? "নিষ্ক্রিয় ইউজার লগইন করতে পারবে না, আর মেনুর হিসাবে গোনা হবে না।"
                      : undefined
                  }
                  icon="shield"
                  tone={user.isActive ? "emerald" : "amber"}
                />
                {user.isActive ? (
                  <ActionButton
                    action={setUserActive.bind(null, userId, false)}
                    variant="danger"
                    confirmMessage={`${user.name}-কে নিষ্ক্রিয় করবেন?`}
                  >
                    নিষ্ক্রিয় করুন
                  </ActionButton>
                ) : (
                  <ActionButton action={setUserActive.bind(null, userId, true)} variant="primary">
                    সক্রিয় করুন
                  </ActionButton>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
