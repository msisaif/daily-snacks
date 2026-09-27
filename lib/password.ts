import bcrypt from "bcryptjs";
import { z } from "zod";

const BCRYPT_COST = 10;

export const passwordSchema = z
  .string()
  .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
  .max(100, "পাসওয়ার্ড সর্বোচ্চ ১০০ অক্ষরের হতে পারে");

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
