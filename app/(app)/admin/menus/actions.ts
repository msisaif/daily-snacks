"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { firstErrorMessage, formText, formValues, type FormState } from "@/lib/form";
import {
  addGuest,
  addLeave,
  addMenuItem,
  assignDefault,
  assignSnack,
  backToDraft,
  closeMenu,
  deleteDraft,
  markDelivered,
  openMenu,
  removeGuest,
  removeLeave,
  removeMenuItem,
  reopenMenu,
  replaceMenuItem,
  saveDraft,
} from "@/lib/menu";
import { dhakaInputToIso } from "@/lib/time";
import { parseId } from "@/lib/validation";

const DATETIME_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const idListSchema = z.array(z.coerce.number({ error: "আইটেম ঠিক নেই" }).int().positive());

const menuFormSchema = z.object({
  menuDate: z.iso.date({ error: "সঠিক তারিখ দিন" }),
  cutoff: z.string().refine((value) => value === "" || DATETIME_LOCAL.test(value), "কাটঅফ সময় ঠিক নেই"),
  note: z.string().trim().max(200, "নোট সর্বোচ্চ ২০০ অক্ষরের হতে পারে"),
  snackIds: idListSchema,
  defaultIds: idListSchema,
});

export async function saveMenuDraft(
  menuId: number | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();

  const parsed = menuFormSchema.safeParse({
    menuDate: formText(formData, "menuDate"),
    cutoff: formText(formData, "cutoff"),
    note: formText(formData, "note"),
    snackIds: formData.getAll("snackIds").map(String),
    defaultIds: [formText(formData, "default_healthy"), formText(formData, "default_unhealthy")].filter(
      (value) => value !== "",
    ),
  });
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error), values: formValues(formData) };
  }
  const { menuDate, cutoff, note, snackIds, defaultIds } = parsed.data;

  const result = await saveDraft({
    menuId,
    menuDate,
    cutoffAt: cutoff ? dhakaInputToIso(cutoff) : null,
    note,
    snackIds,
    defaultIds,
    createdBy: admin.id,
  });
  if ("error" in result) return { error: result.error, values: formValues(formData) };

  revalidatePath("/", "layout");
  if (menuId === null) redirect(`/admin/menus/${result.menuId}`);
  return { success: "খসড়া সেভ হয়েছে" };
}

async function runStatusChange(
  change: () => Promise<string | null>,
  successMessage: string,
): Promise<FormState> {
  await requireAdmin();
  const error = await change();
  if (error) return { error };
  revalidatePath("/", "layout");
  return { success: successMessage };
}

export async function openMenuAction(menuId: number): Promise<FormState> {
  return runStatusChange(() => openMenu(menuId), "মেনু খোলা হয়েছে। এখন সবাই বাছাই করতে পারবে।");
}

export async function closeMenuAction(menuId: number): Promise<FormState> {
  return runStatusChange(() => closeMenu(menuId), "মেনু বন্ধ হয়েছে।");
}

export async function backToDraftAction(menuId: number): Promise<FormState> {
  return runStatusChange(() => backToDraft(menuId), "মেনু খসড়ায় ফেরানো হয়েছে।");
}

export async function markDeliveredAction(menuId: number): Promise<FormState> {
  return runStatusChange(() => markDelivered(menuId), "ডেলিভারি হয়েছে মার্ক করা হয়েছে।");
}

export async function deleteMenuAction(menuId: number): Promise<FormState> {
  const state = await runStatusChange(() => deleteDraft(menuId), "");
  if (state.error) return state;
  redirect("/admin/menus");
}

const reopenSchema = z.object({
  cutoff: z.string().regex(DATETIME_LOCAL, "নতুন কাটঅফ সময় দিন"),
});

export async function reopenMenuAction(
  menuId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = reopenSchema.safeParse({ cutoff: formText(formData, "cutoff") });
  if (!parsed.success) return { error: firstErrorMessage(parsed.error) };

  return runStatusChange(
    () => reopenMenu(menuId, dhakaInputToIso(parsed.data.cutoff)),
    "মেনু আবার খোলা হয়েছে।",
  );
}

// modal-এ আইটেমে ক্লিক করলেই ডাকা হয়, তাই id-ও যাচাই করি
export async function addMenuItemAction(menuId: number, snackItemId: number): Promise<FormState> {
  return runStatusChange(
    async () => (parseId(String(snackItemId)) ? addMenuItem(menuId, snackItemId) : "আইটেম ঠিক নেই"),
    "আইটেম যোগ হয়েছে।",
  );
}

export async function replaceMenuItemAction(
  menuId: number,
  oldSnackItemId: number,
  newSnackItemId: number,
): Promise<FormState> {
  return runStatusChange(
    async () =>
      parseId(String(newSnackItemId))
        ? replaceMenuItem(menuId, oldSnackItemId, newSnackItemId)
        : "আইটেম ঠিক নেই",
    "আইটেম বদলানো হয়েছে।",
  );
}

export async function removeMenuItemAction(menuId: number, snackItemId: number): Promise<FormState> {
  return runStatusChange(() => removeMenuItem(menuId, snackItemId), "আইটেম সরানো হয়েছে।");
}

const guestSchema = z.object({
  name: z.string().trim().max(50, "নাম সর্বোচ্চ ৫০ অক্ষরের হতে পারে"),
  snackItemId: z.coerce.number({ error: "আইটেম বাছাই করুন" }).int().positive("আইটেম বাছাই করুন"),
});

export async function addGuestAction(
  menuId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();

  const parsed = guestSchema.safeParse({
    name: formText(formData, "name"),
    snackItemId: formText(formData, "snackItemId"),
  });
  if (!parsed.success) return { error: firstErrorMessage(parsed.error), values: formValues(formData) };

  const error = await addGuest(menuId, parsed.data.snackItemId, parsed.data.name, admin.id);
  if (error) return { error, values: formValues(formData) };

  revalidatePath("/", "layout");
  return { success: "গেস্ট যোগ হয়েছে" };
}

export async function removeGuestAction(menuId: number, guestId: number): Promise<FormState> {
  return runStatusChange(() => removeGuest(menuId, guestId), "গেস্ট মুছে ফেলা হয়েছে।");
}

// তালিকার প্রতিটা সারি থেকে সরাসরি ডাকা হয়, তাই userId-ও যাচাই করি
async function runForUser(userId: number, change: (adminId: number) => Promise<string | null>): Promise<FormState> {
  const admin = await requireAdmin();
  if (!parseId(String(userId))) return { error: "এমপ্লয়ি ঠিক নেই" };

  const error = await change(admin.id);
  if (error) return { error };
  revalidatePath("/", "layout");
  return {};
}

// choice = আইটেমের id, অথবা "default" (তার গ্রুপের ডিফল্টে ফেরা)
export async function setAssignmentAction(menuId: number, userId: number, choice: string): Promise<FormState> {
  return runForUser(userId, async (adminId) => {
    if (choice === "default") return assignDefault(menuId, userId);

    const snackItemId = parseId(choice);
    if (!snackItemId) return "আইটেম ঠিক নেই";
    return assignSnack(menuId, userId, snackItemId, adminId);
  });
}

export async function setLeaveAction(leaveDate: string, userId: number, onLeave: boolean): Promise<FormState> {
  return runForUser(userId, (adminId) =>
    onLeave ? addLeave(userId, leaveDate, "admin", adminId) : removeLeave(userId, leaveDate, "admin"),
  );
}
