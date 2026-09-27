import type { z } from "zod";

export type FormState = {
  error?: string;
  success?: string;
};

export function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function firstErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "ইনপুট ঠিক নেই";
}
