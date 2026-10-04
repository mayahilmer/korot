import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import puppeteer, { type Browser } from "puppeteer-core";
import { buildCvHtml } from "@/lib/cv-html";
import { buildDocx } from "@/lib/cv-docx";
import { documentFontCss } from "@/lib/fonts";
import { normalizeCv, toView } from "@/lib/model";
import { contentDisposition, downloadName } from "@/lib/text";
import type { Lang } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/usr/local/bin/google-chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter((item): item is string => Boolean(item));

const fontCache = new Map<string, string>();

function embeddedFontCss(): string {
  return documentFontCss((file) => {
    const cached = fontCache.get(file);
    if (cached) return cached;
    const filePath = path.join(process.cwd(), "public", "fonts", file);
    const uri = `data:font/woff2;base64,${readFileSync(filePath).toString("base64")}`;
    fontCache.set(file, uri);
    return uri;
  });
}

let browserPromise: Promise<Browser> | null = null;

function findChrome(): string | undefined {
  return CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
}

async function getBrowser(): Promise<Browser> {
  const executablePath = findChrome();
  if (!executablePath) {
    throw new Error("chrome-missing");
  }
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({
        executablePath,
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
      })
      .catch((error) => {
        browserPromise = null;
        throw error;
      });
  }
  return browserPromise;
}

function message(lang: Lang, he: string, en: string): string {
  return lang === "en" ? en : he;
}

function jsonError(lang: Lang, he: string, en: string, status: number): Response {
  return Response.json({ error: message(lang, he, en) }, { status });
}

export async function POST(request: Request): Promise<Response> {
  let lang: Lang = "he";
  try {
    const raw = await request.text();
    if (raw.length > 400_000) {
      return jsonError(lang, "המסמך ארוך מדי.", "The document is too long.", 413);
    }
    const body = JSON.parse(raw) as { format?: unknown; cv?: unknown };
    const cv = normalizeCv(body.cv);
    lang = cv.lang;
    const format = body.format === "docx" || body.format === "pdf" ? body.format : cv.format;
    if (!cv.personal.fullName.trim()) {
      return jsonError(
        lang,
        "חסר שם מלא. בלי שם המסמך לא מוכן.",
        "A full name is required before the file can be made.",
        400,
      );
    }

    const view = toView(cv);
    const fallback = lang === "en" ? "resume" : "קורות-חיים";

    if (format === "docx") {
      const buffer = await buildDocx(view);
      const filename = downloadName(view.name, "docx", fallback);
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": contentDisposition(filename),
          "Cache-Control": "no-store",
        },
      });
    }

    const html = buildCvHtml(view, { mode: "pdf", fontCss: embeddedFontCss() });
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: "load", timeout: 20000 });
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      await page.emulateMediaType("print");
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0", bottom: "0", left: "0", right: "0" },
      });
      const filename = downloadName(view.name, "pdf", fallback);
      return new Response(Buffer.from(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": contentDisposition(filename),
          "Cache-Control": "no-store",
        },
      });
    } finally {
      await page.close().catch(() => undefined);
    }
  } catch (error) {
    console.error(error);
    if (error instanceof SyntaxError) {
      return jsonError(lang, "הבקשה לא תקינה.", "The request could not be read.", 400);
    }
    browserPromise = null;
    const missing = error instanceof Error && error.message === "chrome-missing";
    return jsonError(
      lang,
      missing
        ? "לא נמצא Chrome ליצירת PDF. אפשר להוריד Word."
        : "לא הצלחנו ליצור PDF. אפשר לנסות שוב, או להוריד Word.",
      missing
        ? "Chrome was not found, so the PDF could not be made. Word still works."
        : "The PDF could not be made. Try again, or download Word.",
      500,
    );
  }
}
