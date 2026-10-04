import type { Lang } from "@/lib/types";

const HE_EN: Array<[string, string]> = [
  ["מעקב אחרי הזמנות חריגות ודיווח שבועי להנהלה.", "Tracked order exceptions and sent a weekly report to management."],
  ["ירידה של", "a reduction of"],
  ["בהזמנות שחזרו", "in returned orders"],
  ["בגלל ליקוט שגוי", "because of mis-picks"],
  ["הזמנות חריגות", "order exceptions"],
  ["דיווח שבועי להנהלה", "a weekly report to management"],
  ["מעקב אחרי", "tracked"],
  ["בלי להגדיל את הצוות", "without growing the team"],
  ["מחסן אזורי", "a regional warehouse"],
  ["בהצטיינות יתרה", "with highest honors"],
  ["המרכז הרפואי שיבא", "Sheba Medical Center"],
  ["בית חולים שיבא", "Sheba Medical Center"],
  ["משקית שלישות", "Personnel NCO"],
  ["קצינת שלישות", "Personnel officer"],
  ["קצין שלישות", "Personnel officer"],
  ["בסיס תל השומר", "Tel Hashomer"],
  ["מקצועות מורחבים", "extended subjects"],
  ["רכזת תפעול", "Operations Coordinator"],
  ["רכז תפעול", "Operations Coordinator"],
  ["מנהלת תפעול", "Operations Manager"],
  ["מנהל תפעול", "Operations Manager"],
  ["המכללה למנהל", "College of Management"],
  ["שקד לוגיסטיקה", "Shaked Logistics"],
  ["מילוא אריזות", "Milou Packaging"],
  ["ראשון לציון", "Rishon LeZion"],
  ["פתח תקווה", "Petah Tikva"],
  ["בגרות מלאה", "full matriculation"],
  ["תל אביב-יפו", "Tel Aviv-Yafo"],
  ["שירות לאומי", "National Service"],
  ["שירות צבאי", "Military service"],
  ["בהצטיינות", "with honors"],
  ["תואר ראשון", "B.A."],
  ["תואר שני", "M.A."],
  ["תל השומר", "Tel Hashomer"],
  ["תל אביב", "Tel Aviv"],
  ["באר שבע", "Be'er Sheva"],
  ["ירושלים", "Jerusalem"],
  ["עברית", "Hebrew"],
  ["אנגלית", "English"],
  ["ערבית", "Arabic"],
  ["רוסית", "Russian"],
  ["צרפתית", "French"],
  ["ספרדית", "Spanish"],
  ["אמהרית", "Amharic"],
  ["חיפה", "Haifa"],
];

const PRODUCT_NAMES = new Set([
  "office",
  "excel",
  "word",
  "powerpoint",
  "salesforce",
  "python",
  "photoshop",
  "figma",
  "sql",
  "sap",
  "google workspace",
  "javascript",
]);

const cache = new Map<string, string>();

function letter(char: string): boolean {
  return /[\p{L}]/u.test(char);
}

function replacePhrase(text: string, phrase: string, replacement: string): string {
  let out = "";
  let index = 0;
  while (index < text.length) {
    const at = text.indexOf(phrase, index);
    if (at < 0) return out + text.slice(index);
    const before = at > 0 ? text[at - 1] : "";
    const after = text[at + phrase.length] ?? "";
    if (letter(before) || letter(after)) {
      out += text.slice(index, at + 1);
      index = at + 1;
      continue;
    }
    out += text.slice(index, at) + replacement;
    index = at + phrase.length;
  }
  return out;
}

function pairsFor(target: Lang): Array<[string, string]> {
  if (target === "en") return HE_EN;
  const map = new Map<string, string>();
  for (const [he, en] of HE_EN) {
    if (!map.has(en)) map.set(en, he);
  }
  return [...map.entries()].sort((a, b) => b[0].length - a[0].length);
}

export function applyGlossary(text: string, target: Lang): string {
  return pairsFor(target).reduce((out, [from, to]) => replacePhrase(out, from, to), text);
}

export function needsTranslation(text: string, target: Lang): boolean {
  if (target === "en") return /[\u0590-\u05FF]/.test(text);
  return /[A-Za-z]/.test(text) && !PRODUCT_NAMES.has(text.trim().toLowerCase());
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function polishEnglishLine(line: string): string {
  let out = line
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2")
    .replace(/([A-Za-z])-(\d)/g, "$1 $2");
  out = out.replace(/(^|[.!?]\s+)(?:I am|I'm|I have|I've)\s+/gi, "$1");
  out = out.replace(/(^|[.!?]\s+)I\s+(?=[a-z])/g, "$1");
  out = out.replace(/^(\p{Ll})/u, (char) => char.toUpperCase());
  out = out.replace(/([.!?])\s+(\p{Ll})/gu, (match, punct: string, lower: string, offset: number, source: string) => {
    const previous = source[offset - 1] ?? "";
    if (punct === "." && previous === previous.toUpperCase() && /[A-Z]/.test(previous)) return match;
    return `${punct} ${lower.toUpperCase()}`;
  });
  return out.trim();
}

export function polishTranslation(text: string, target: Lang): string {
  const decoded = decodeEntities(text).replace(/[ \t]+/g, " ").trim();
  if (target !== "en") return decoded;
  return decoded
    .split("\n")
    .map((line) => polishEnglishLine(line))
    .filter((line) => line.length > 0)
    .join("\n");
}

function splitForApi(text: string): string[] {
  if (text.length <= 400) return [text];
  const parts = text.split(/(\n+|(?<=[.!?׃])\s+)/);
  const chunks: string[] = [];
  let buffer = "";
  for (const part of parts) {
    if ((buffer + part).length > 400 && buffer) {
      chunks.push(buffer);
      buffer = part;
    } else {
      buffer += part;
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks;
}

export async function askMyMemory(text: string, target: Lang): Promise<string> {
  const key = `${target}\n${text}`;
  const saved = cache.get(key);
  if (saved) return saved;
  const pair = target === "en" ? "he|en" : "en|he";
  const chunks = splitForApi(text);
  const translated: string[] = [];
  for (const chunk of chunks) {
    if (!needsTranslation(chunk, target)) {
      translated.push(chunk);
      continue;
    }
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${pair}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error("translate");
    const payload = (await response.json()) as {
      responseStatus?: number;
      responseData?: { translatedText?: string };
    };
    const value = payload.responseData?.translatedText;
    if (typeof value !== "string" || payload.responseStatus !== 200 || /MYMEMORY WARNING/i.test(value)) {
      throw new Error("translate");
    }
    translated.push(value);
  }
  const joined = translated.join("");
  cache.set(key, joined);
  return joined;
}

export async function translatePlain(
  text: string,
  target: Lang,
  ask: (text: string, target: Lang) => Promise<string> = askMyMemory,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || PRODUCT_NAMES.has(trimmed.toLowerCase()) || !needsTranslation(trimmed, target)) return text;
  const glossed = applyGlossary(trimmed, target);
  const translated = needsTranslation(glossed, target) ? await ask(glossed, target) : glossed;
  const polished = polishTranslation(translated, target);
  if (needsTranslation(polished, target)) throw new Error("translate");
  return polished;
}

export async function translateMany(texts: string[], target: Lang): Promise<string[]> {
  const unique = [...new Set(texts)];
  const done = new Map<string, string>();
  let cursor = 0;
  async function worker() {
    while (cursor < unique.length) {
      const index = cursor;
      cursor += 1;
      const text = unique[index];
      done.set(text, await translatePlain(text, target));
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  return texts.map((text) => done.get(text) ?? text);
}
