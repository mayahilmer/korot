"use client";

import { useEffect, useRef } from "react";

export function CvPreview({
  css,
  markup,
  label,
}: {
  css: string;
  markup: string;
  label: string;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const shadow = node.shadowRoot ?? node.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${css}</style>${markup}`;
  }, [css, markup]);

  return (
    <div className="overflow-hidden rounded-sm bg-white shadow-[0_18px_50px_rgba(48,36,22,0.14)]">
      <div
        ref={host}
        role="region"
        aria-label={label}
        className="h-[72vh] min-h-[560px] overflow-auto bg-white lg:h-[calc(100vh-7.5rem)]"
      />
    </div>
  );
}
