import type { FontChoice } from "@/lib/types";

const HEBREW_RANGE =
  "U+0307-0308,U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F";
const LATIN_RANGE =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";

const DOCUMENT_FONTS = [
  ["CV David", "david-400-he.woff2", 400, "he"],
  ["CV David", "david-400-lat.woff2", 400, "lat"],
  ["CV David", "david-700-he.woff2", 700, "he"],
  ["CV David", "david-700-lat.woff2", 700, "lat"],
  ["CV Arimo", "arimo-400-he.woff2", 400, "he"],
  ["CV Arimo", "arimo-400-lat.woff2", 400, "lat"],
  ["CV Arimo", "arimo-700-he.woff2", 700, "he"],
  ["CV Arimo", "arimo-700-lat.woff2", 700, "lat"],
] as const;

export function documentFontCss(srcFor: (file: string) => string): string {
  return DOCUMENT_FONTS.map(([family, file, weight, range]) => {
    const unicodeRange = range === "he" ? HEBREW_RANGE : LATIN_RANGE;
    return `@font-face{font-family:"${family}";src:url("${srcFor(file)}") format("woff2");font-weight:${weight};font-style:normal;font-display:swap;unicode-range:${unicodeRange};}`;
  }).join("\n");
}

export function fontFamily(font: FontChoice): string {
  if (font === "david") {
    return '"CV David", David, "David Libre", "Times New Roman", serif';
  }
  return '"CV Arimo", Arial, Arimo, "Helvetica Neue", sans-serif';
}

export function docxFontName(font: FontChoice): string {
  return font === "david" ? "David" : "Arial";
}

export const previewFontCss = documentFontCss((file) => `/fonts/${file}`);
