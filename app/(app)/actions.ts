"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { formText, type FormState } from "@/lib/form";
import { chooseSnack, clearChoice } from "@/lib/menu";
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
