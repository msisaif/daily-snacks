// বাংলাদেশে daylight saving নেই, তাই Asia/Dhaka সবসময় UTC+6
export const TIME_ZONE = "Asia/Dhaka";
const DHAKA_OFFSET = "+06:00";
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;

// "YYYY-MM-DD", ঢাকার হিসাবে আজকের তারিখ
export function todayInDhaka(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

// ঢাকার তারিখ + সময় ("2026-09-28", "16:00") থেকে ISO UTC
export function dhakaToIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00${DHAKA_OFFSET}`).toISOString();
}

// <input type="datetime-local">-এর মান ("2026-09-28T16:00", ঢাকা সময়) থেকে ISO UTC
export function dhakaInputToIso(value: string): string {
  const [date, time] = value.split("T");
  return dhakaToIso(date, time);
}

// ISO UTC থেকে <input type="datetime-local">-এর মান (ঢাকা সময়)
export function isoToDhakaInput(iso: string): string {
  const shifted = new Date(new Date(iso).getTime() + DHAKA_OFFSET_MS);
  return shifted.toISOString().slice(0, 16);
}
