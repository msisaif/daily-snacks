import { z } from "zod";
import { CATEGORIES, ROLES } from "@/lib/constants";

export const nameSchema = z
  .string()
  .trim()
  .min(1, "নাম দিন")
  .max(100, "নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে");

export const employeeIdSchema = z
  .string()
  .trim()
  .min(1, "Employee ID দিন")
  .max(50, "Employee ID সর্বোচ্চ ৫০ অক্ষরের হতে পারে")
  .regex(
    /^[A-Za-z0-9._-]+$/,
    "Employee ID-তে শুধু ইংরেজি অক্ষর, সংখ্যা, ডট (.), হাইফেন (-) বা আন্ডারস্কোর (_) থাকতে পারে",
  );

export const categorySchema = z.enum(CATEGORIES, { error: "গ্রুপ বাছাই করুন" });

export const roleSchema = z.enum(ROLES, { error: "রোল বাছাই করুন" });

export function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
