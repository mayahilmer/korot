import type { Lang } from "@/lib/types";

const HE_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function monthNames(lang: Lang): string[] {
  return lang === "he" ? HE_MONTHS : EN_MONTHS;
}

export function monthName(month: string, lang: Lang): string {
  const index = Number(month) - 1;
  if (!Number.isInteger(index) || index < 0 || index > 11) return "";
  return monthNames(lang)[index];
}

export function formatMonthYear(month: string, year: string, lang: Lang): string {
  const name = monthName(month, lang);
  const cleanYear = year.trim();
  if (name && cleanYear) return `${name} ${cleanYear}`;
  return name || cleanYear;
}

export function formatSpan(
  fromMonth: string,
  fromYear: string,
  toMonth: string,
  toYear: string,
  current: boolean,
  lang: Lang,
  present: string,
): string {
  const start = formatMonthYear(fromMonth, fromYear, lang);
  const end = current ? present : formatMonthYear(toMonth, toYear, lang);
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

export function formatYears(
  fromYear: string,
  toYear: string,
  current: boolean,
  present: string,
): string {
  const start = fromYear.trim();
  const end = current ? present : toYear.trim();
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

function pointKey(month: string, year: string, fallbackMonth: number): number | null {
  const parsedYear = Number(year);
  if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2200) {
    return null;
  }
  const parsedMonth = Number(month);
  const safeMonth =
    Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : fallbackMonth;
  return parsedYear * 12 + safeMonth;
}

export function chronologyKey(
  fromMonth: string,
  fromYear: string,
  toMonth: string,
  toYear: string,
  current: boolean,
): number {
  const start = pointKey(fromMonth, fromYear, 1);
  if (current) return 1_000_000 + (start ?? 0);
  const end = pointKey(toMonth, toYear, 12);
  if (end !== null) return end;
  if (start !== null) return start;
  return 0;
}

export function rangeIsBackwards(
  fromMonth: string,
  fromYear: string,
  toMonth: string,
  toYear: string,
  current: boolean,
): boolean {
  if (current) return false;
  const start = pointKey(fromMonth, fromYear, 1);
  const end = pointKey(toMonth, toYear, 12);
  if (start === null || end === null) return false;
  return end < start;
}

export function digitsOnly(value: string, max: number): string {
  return value.replace(/\D/g, "").slice(0, max);
}
