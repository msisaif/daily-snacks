import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/action-button";
import { Badge, cardClass, CategoryBadge, MenuStatusBadge, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatDateTime, formatNumber, formatTaka } from "@/lib/format";
import { countSelections, getMenu, getMenuOptions, listSnacksForMenuForm } from "@/lib/menu";
import { getSettings } from "@/lib/settings";
import { isoToDhakaInput, todayInDhaka } from "@/lib/time";
import { parseId } from "@/lib/validation";
import {
  backToDraftAction,
  closeMenuAction,
  deleteMenuAction,
  markDeliveredAction,
  openMenuAction,
  reopenMenuAction,
  saveMenuDraft,
} from "../actions";
import { MenuForm, ReopenForm } from "../menu-forms";

export const metadata: Metadata = { title: "মেনু" };

export default async function MenuDetailPage({ params }: PageProps<"/admin/menus/[id]">) {
  await requireAdmin();
  const menuId = parseId((await params).id);
  if (!menuId) notFound();

  const menu = await getMenu(menuId);
  if (!menu) notFound();

  const options = await getMenuOptions(menuId);
  const selectionCount = await countSelections(menuId);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <PageHeader title={formatDate(menu.menuDate)} backHref="/admin/menus" />

      <section className={`${cardClass} space-y-1 text-sm`}>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">অবস্থা:</span>
          <MenuStatusBadge status={menu.status} />
        </div>
        {menu.cutoffAt && (
          <p>
            <span className="text-slate-500">কাটঅফ:</span> {formatDateTime(menu.cutoffAt)}
          </p>
        )}
        {menu.closedAt && (
          <p>
            <span className="text-slate-500">বন্ধ হয়েছে:</span> {formatDateTime(menu.closedAt)}
          </p>
        )}
        {menu.deliveredAt && (
          <p>
            <span className="text-slate-500">ডেলিভারি:</span> {formatDateTime(menu.deliveredAt)}
          </p>
        )}
        {menu.status === "open" && (
          <p>
            <span className="text-slate-500">এখন পর্যন্ত নিজে বেছেছে:</span>{" "}
            {formatNumber(selectionCount)} জন
          </p>
        )}
        {(menu.status === "closed" || menu.status === "delivered") && (
          <p>
            <span className="text-slate-500">মোট:</span> {formatNumber(selectionCount)} জন (ডিফল্টসহ)
          </p>
        )}
        {menu.note && <p className="text-slate-600">নোট: {menu.note}</p>}
      </section>

      {menu.status === "draft" ? (
        <DraftSection menuId={menuId} menu={menu} options={options} />
      ) : (
        <section className={cardClass}>
          <h2 className="mb-2 font-semibold">আইটেম</h2>
          <ul className="space-y-2">
            {options.map((option) => (
              <li key={option.snackItemId} className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate">{option.name}</span>
                <span className="flex shrink-0 items-center gap-1">
                  <span className="text-sm">{formatTaka(option.price)}</span>
                  <CategoryBadge category={option.category} />
                  {option.isDefault && <Badge tone="blue">ডিফল্ট</Badge>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {menu.status === "open" && (
        <section className={`${cardClass} space-y-3`}>
          <h2 className="font-semibold">মেনু খোলা আছে</h2>
          <ActionButton
            action={closeMenuAction.bind(null, menuId)}
            variant="danger"
            confirmMessage="কাটঅফের আগেই মেনু বন্ধ করবেন? যারা বাছেনি তারা ডিফল্ট পাবে।"
          >
            এখনই বন্ধ করুন
          </ActionButton>
          {selectionCount === 0 && (
            <ActionButton action={backToDraftAction.bind(null, menuId)}>
              খসড়ায় ফেরান (আইটেম বদলাতে)
            </ActionButton>
          )}
        </section>
      )}

      {menu.status === "closed" && (
        <>
          <section className={`${cardClass} space-y-3`}>
            <h2 className="font-semibold">অর্ডার দেওয়া আর নাস্তা আসার পর</h2>
            <ActionButton action={markDeliveredAction.bind(null, menuId)} variant="primary">
              ডেলিভারি হয়েছে
            </ActionButton>
          </section>
          <section className={cardClass}>
            <h2 className="mb-1 font-semibold">আবার খুলুন</h2>
            <p className="mb-3 text-xs text-slate-500">
              নতুন কাটঅফ লাগবে। বন্ধের সময় অটো-বসানো ডিফল্টগুলো মুছে যাবে; যারা নিজে বেছেছিল
              তাদের বাছাই থাকবে।
            </p>
            <ReopenForm action={reopenMenuAction.bind(null, menuId)} />
          </section>
        </>
      )}
    </div>
  );
}

async function DraftSection({
  menuId,
  menu,
  options,
}: {
  menuId: number;
  menu: { menuDate: string; cutoffAt: string | null; note: string | null };
  options: { snackItemId: number; isDefault: boolean }[];
}) {
  const snacks = await listSnacksForMenuForm(menuId);
  const settings = await getSettings();

  return (
    <>
      <section className={cardClass}>
        <h2 className="mb-3 font-semibold">খসড়া এডিট</h2>
        <MenuForm
          action={saveMenuDraft.bind(null, menuId)}
          snacks={snacks}
          minDate={todayInDhaka()}
          defaultCutoffTime={settings.defaultCutoffTime}
          submitLabel="খসড়া সেভ করুন"
          initial={{
            menuDate: menu.menuDate,
            cutoff: menu.cutoffAt ? isoToDhakaInput(menu.cutoffAt) : "",
            note: menu.note ?? "",
            snackIds: options.map((option) => option.snackItemId),
            defaultIds: options.filter((option) => option.isDefault).map((option) => option.snackItemId),
          }}
        />
      </section>

      <section className={`${cardClass} space-y-3`}>
        <h2 className="font-semibold">প্রস্তুত?</h2>
        <p className="text-xs text-slate-500">
          খোলার সময় আইটেমের বর্তমান দাম আর গ্রুপ আবার যাচাই হয়ে মেনুতে সেভ হবে। খোলার পর আইটেম
          বদলানো যাবে না (যতক্ষণ কেউ বাছাই না করে, খসড়ায় ফেরানো যাবে)।
        </p>
        <ActionButton action={openMenuAction.bind(null, menuId)} variant="primary">
          মেনু খুলুন
        </ActionButton>
        <ActionButton
          action={deleteMenuAction.bind(null, menuId)}
          variant="danger"
          confirmMessage="এই খসড়া মেনু মুছে ফেলবেন?"
        >
          খসড়া মুছুন
        </ActionButton>
      </section>
    </>
  );
}
