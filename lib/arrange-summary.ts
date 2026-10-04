const BULLET = /^[-–—•*·▪►]+\s*/;
const HEBREW_FILLERS = new Set([
  "מאוד",
  "בעצם",
  "באמת",
  "כמובן",
  "פשוט",
  "בעיקרון",
  "הרי",
  "כאילו",
  "נורא",
  "וכו",
  "וכו׳",
]);
const ENGLISH_FILLERS = new Set([
  "very",
  "really",
  "basically",
  "actually",
  "just",
  "simply",
  "quite",
  "extremely",
]);

function bareToken(token: string): string {
  return token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function tightenLine(line: string): string {
  const spaced = line.replace(/\bin order to\b/gi, "to");
  const kept: string[] = [];
  for (const token of spaced.split(/\s+/).filter(Boolean)) {
    const bare = bareToken(token);
    const key = bare.toLowerCase();
    if (!bare || HEBREW_FILLERS.has(bare) || ENGLISH_FILLERS.has(key)) continue;
    if (kept.length === 0 && (bare === "אני" || key === "i")) continue;
    const previous = kept.length ? bareToken(kept[kept.length - 1]).toLowerCase() : "";
    if (previous && previous === key) continue;
    kept.push(token);
  }
  return clean(kept.join(" "));
}

function wordsOf(line: string): string[] {
  return (line.match(/[\p{L}\p{N}]+/gu) ?? []).map((word) => word.toLowerCase());
}

function dropRedundant(parts: string[]): string[] {
  const kept: string[] = [];
  const bags: Set<string>[] = [];
  for (const part of parts) {
    const words = wordsOf(part);
    const bag = new Set(words);
    const redundant = bags.some((earlier) => {
      const content = words.filter((word) => word.length > 1);
      if (content.length === 0 || !content.every((word) => earlier.has(word))) return false;
      return !words.some((word) => /\d/.test(word) && !earlier.has(word));
    });
    if (redundant) continue;
    kept.push(part);
    bags.push(bag);
  }
  return kept;
}

function clean(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
}

function stripEnding(value: string): string {
  return value.replace(/[.;!?׃…\s]+$/g, "").trim();
}

function finishSentence(value: string): string {
  const text = clean(value);
  if (!text) return "";
  if (/[.!?׃…]$/.test(text)) return text;
  return `${text}.`;
}

function splitSentences(value: string): string[] {
  const parts = value
    .split(/(?<=[.!?׃])\s+/)
    .map(clean)
    .filter(Boolean);
  return parts.length > 1 ? parts : [value];
}

function splitLong(value: string, maxPieces: number): string[] {
  if (maxPieces <= 1 || value.length < 180) return [value];
  const pieces = value
    .split(/[,;]\s+/)
    .map(clean)
    .filter(Boolean);
  if (pieces.length < 2) return [value];
  const groups = Math.min(maxPieces, pieces.length, 4);
  const size = Math.ceil(pieces.length / groups);
  const grouped: string[] = [];
  for (let index = 0; index < pieces.length && grouped.length < groups; index += size) {
    grouped.push(pieces.slice(index, index + size).join(", "));
  }
  return grouped;
}

function extractParts(raw: string): string[] {
  const source = raw.replace(/\r/g, "").trim();
  if (!source) return [];

  let parts = source
    .split(/\n+/)
    .map((line) => clean(line.replace(BULLET, "")))
    .filter(Boolean);

  if (parts.length === 1) {
    const sentences = splitSentences(parts[0]).map(clean).filter(Boolean);
    if (sentences.length > 1) parts = sentences;
  }

  const expanded: string[] = [];
  for (const part of parts) {
    const room = Math.max(1, 4 - expanded.length);
    if (part.length > 180 && expanded.length < 4) {
      expanded.push(...splitLong(part, room));
    } else {
      expanded.push(part);
    }
  }
  return expanded.filter(Boolean);
}

export function summaryLineCount(value: string): number {
  return value
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;
}

/**
 * Turns free notes into at most four short lines.
 * Repeated words and filler are removed. Nothing new is added.
 */
export function arrangeSummary(raw: string): string {
  const parts = dropRedundant(extractParts(raw).map(tightenLine).filter(Boolean));
  if (parts.length === 0) return "";

  const lines =
    parts.length <= 4
      ? parts
      : [...parts.slice(0, 3), parts.slice(3).map(stripEnding).join("; ")];

  return lines.map(finishSentence).filter(Boolean).join("\n");
}
