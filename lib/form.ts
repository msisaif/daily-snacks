import type { z } from "zod";

export type FormState = {
  error?: string;
  success?: string;
  // এরর হলে ইউজারের লেখা মান ফেরত যায়, যাতে ফর্ম রিসেট হয়ে সব মুছে না যায়
  values?: Record<string, string>;
};

export function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

// একই নামের একাধিক মান (যেমন checkbox) কমা দিয়ে জোড়া লাগে: "3,7"
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    const isInternal = key.startsWith("$");
    const isPassword = key.toLowerCase().includes("password");
    if (typeof value === "string" && !isInternal && !isPassword) {
      values[key] = key in values ? `${values[key]},${value}` : value;
    }
  }
  return values;
}

export function firstErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "ইনপুট ঠিক নেই";
}
