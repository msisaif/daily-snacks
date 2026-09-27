import { TIME_ZONE } from "./time.ts";

const numberFormat = new Intl.NumberFormat("bn-BD", { maximumFractionDigits: 2 });

const dateFormat = new Intl.DateTimeFormat("bn-BD", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateTimeFormat = new Intl.DateTimeFormat("bn-BD", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  dayPeriod: "short",
});

const monthFormat = new Intl.DateTimeFormat("bn-BD", {
  timeZone: TIME_ZONE,
  month: "long",
  year: "numeric",
});

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatTaka(amount: number): string {
  return `৳${numberFormat.format(amount)}`;
}

// "2026-09-28" -> "সোমবার, ২৮ সেপ্টেম্বর, ২০২৬"
export function formatDate(date: string): string {
  return dateFormat.format(new Date(`${date}T12:00:00+06:00`));
}

// ISO UTC -> "২৮ সেপ, ৪:০০ বিকাল" (ঢাকা সময়)
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

// "2026-09" -> "সেপ্টেম্বর ২০২৬"
export function formatMonth(month: string): string {
  return monthFormat.format(new Date(`${month}-15T12:00:00+06:00`));
}
