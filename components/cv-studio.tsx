"use client";

import { useEffect, useMemo, useSyncExternalStore, useState } from "react";
import { CvForm } from "@/components/cv-form";
import { CvPreview } from "@/components/cv-preview";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { copyFor } from "@/lib/copy";
import { previewFontCss } from "@/lib/fonts";
import { renderCv } from "@/lib/cv-html";
import { emptyCv, normalizeCv, sampleCv, toView } from "@/lib/model";
import { switchLanguage } from "@/lib/switch-language";
import type { CvData, ExportFormat, Lang } from "@/lib/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "korot-draft-v1";
const DRAFT_EVENT = "korot-draft";

function subscribeToDraft(onStoreChange: () => void) {
  window.addEventListener(DRAFT_EVENT, onStoreChange);
  return () => window.removeEventListener(DRAFT_EVENT, onStoreChange);
}

function readDraft(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeDraft(cv: CvData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cv));
  window.dispatchEvent(new Event(DRAFT_EVENT));
}

function parseDraft(raw: string): CvData {
  if (!raw) return emptyCv();
  try {
    return normalizeCv(JSON.parse(raw));
  } catch {
    return emptyCv();
  }
}

export function CvStudio() {
  const rawDraft = useSyncExternalStore(subscribeToDraft, readDraft, () => "");
  const cv = useMemo(() => parseDraft(rawDraft), [rawDraft]);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [translating, setTranslating] = useState(false);
  const preview = useMemo(
    () => renderCv(toView(cv), { mode: "preview", fontCss: previewFontCss }),
    [cv],
  );

  useEffect(() => {
    document.documentElement.lang = cv.lang;
    document.documentElement.dir = cv.lang === "he" ? "rtl" : "ltr";
  }, [cv.lang]);

  function setCv(next: CvData | ((current: CvData) => CvData)) {
    const value = typeof next === "function" ? next(cv) : next;
    writeDraft(value);
  }

  const copy = useMemo(() => copyFor(cv.lang), [cv.lang]);
  const primaryLabel = cv.format === "pdf" ? copy.downloadPdf : copy.downloadWord;
  const secondaryFormat: ExportFormat = cv.format === "pdf" ? "docx" : "pdf";
  const secondaryLabel = cv.format === "pdf" ? copy.alsoWord : copy.alsoPdf;

  async function changeLanguage(lang: Lang) {
    if (lang === cv.lang || translating) return;
    setTranslating(true);
    setError("");
    try {
      const next = await switchLanguage(cv, lang);
      setCv(next);
    } catch {
      setError(copy.translateFailed);
    } finally {
      setTranslating(false);
    }
  }

  async function download(format: ExportFormat) {
    if (!cv.personal.fullName.trim()) {
      setError(copy.nameRequired);
      setTab("edit");
      document.getElementById("full-name")?.focus();
      return;
    }
    setExporting(format);
    setError("");
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, cv }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || copy.exportFailed);
      }
      const blob = await response.blob();
      const filename = filenameFromHeader(response.headers.get("Content-Disposition")) || "cv";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : copy.exportFailed);
    } finally {
      setExporting(null);
    }
  }

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setConfirmClear(false);
          setError("");
          setCv((current) => sampleCv(current.lang, current));
          setTab("preview");
        }}
      >
        {copy.sample}
      </Button>
      {confirmClear ? (
        <>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              const fresh = emptyCv();
              fresh.lang = cv.lang;
              fresh.font = cv.font;
              fresh.format = cv.format;
              setCv(fresh);
              setConfirmClear(false);
              setError("");
            }}
          >
            {copy.clearConfirm}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setConfirmClear(false)}>
            {copy.cancel}
          </Button>
        </>
      ) : (
        <Button type="button" variant="ghost" onClick={() => setConfirmClear(true)}>
          {copy.clear}
        </Button>
      )}
      <Button
        type="button"
        size="lg"
        className="h-10 px-4"
        disabled={exporting !== null}
        onClick={() => download(cv.format)}
      >
        {exporting === cv.format ? copy.downloading : primaryLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={exporting !== null}
        onClick={() => download(secondaryFormat)}
      >
        {exporting === secondaryFormat ? copy.downloading : secondaryLabel}
      </Button>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col px-4 pb-28 pt-5 sm:px-6 lg:pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{copy.brand}</h1>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{copy.tagline}</p>
        </div>
        <div className="hidden lg:block">{actions}</div>
      </header>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Separator className="mt-4" />
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-0.5 lg:hidden">
        {(["edit", "preview"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={tab === item}
            onClick={() => setTab(item)}
            className={cn(
              "h-9 rounded-md text-sm",
              tab === item ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {item === "edit" ? copy.edit : copy.preview}
          </button>
        ))}
      </div>
      <div className="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(460px,640px)]">
        <div className={cn(tab !== "edit" && "hidden", "min-w-0 lg:block")}>
          <div className="mb-3 lg:hidden">{actions}</div>
          <CvForm
            cv={cv}
            copy={copy}
            translating={translating}
            onLanguage={(lang) => {
              void changeLanguage(lang);
            }}
            update={(recipe) => {
              setError("");
              setCv((current) => recipe(current));
            }}
          />
        </div>
        <aside className={cn(tab !== "preview" && "hidden", "min-w-0 lg:block")}>
          <div className="lg:sticky lg:top-4">
            <p className="mb-2 text-sm text-muted-foreground">{copy.previewCaption}</p>
            <CvPreview css={preview.css} markup={preview.markup} label={copy.previewCaption} />
          </div>
        </aside>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
        <Button
          type="button"
          className="h-10 w-full"
          disabled={exporting !== null}
          onClick={() => download(cv.format)}
        >
          {exporting === cv.format ? copy.downloading : primaryLabel}
        </Button>
      </div>
    </div>
  );
}

function filenameFromHeader(header: string | null): string {
  if (!header) return "";
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded;
    }
  }
  const plain = /filename="([^"]+)"/i.exec(header)?.[1];
  return plain ?? "";
}
