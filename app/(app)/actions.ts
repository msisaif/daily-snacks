"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { formText, type FormState } from "@/lib/form";
import { addLeave, chooseSnack, clearChoice, removeLeave } from "@/lib/menu";
import { parseId } from "@/lib/validation";

// choice = আইটেমের id, অথবা "default" (নিজের বাছাই মুছে ডিফল্টে ফেরা)
export async function updateChoice(
  menuId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const choice = formText(formData, "choice");

  let error: string | null;
  if (choice === "default") {
    error = await clearChoice(menuId, user.id);
  } else {
    const snackItemId = parseId(choice);
    if (!snackItemId) return { error: "আইটেম ঠিক নেই" };
    error = await chooseSnack(menuId, user.id, snackItemId);
  }
  if (error) return { error };

  revalidatePath("/", "layout");
  return {};
}

export async function takeLeave(leaveDate: string): Promise<FormState> {
  const user = await requireUser();
  const error = await addLeave(user.id, leaveDate, "self", user.id);
  if (error) return { error };

  revalidatePath("/", "layout");
  return {};
}

export async function cancelLeave(leaveDate: string): Promise<FormState> {
  const user = await requireUser();
  const error = await removeLeave(user.id, leaveDate, "self");
  if (error) return { error };

  revalidatePath("/", "layout");
  return {};
}
