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
    shadow.innerHTML = `<style>${css}
      .fit { width: max-content; transform-origin: top left; }
    </style><div class="fit">${markup}</div>`;
    const paper = shadow.querySelector(".fit");
    if (!(paper instanceof HTMLElement)) return;

    const fit = () => {
      const natural = paper.offsetWidth;
      const scale = natural > 0 ? Math.min(1, node.clientWidth / natural) : 1;
      paper.style.transform = `scale(${scale})`;
      paper.style.marginBottom = `${paper.offsetHeight * (scale - 1)}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(node);
    observer.observe(paper);
    return () => observer.disconnect();
  }, [css, markup]);

  return (
    <div className="max-w-full overflow-hidden rounded-sm bg-white shadow-[0_18px_50px_rgba(48,36,22,0.14)]">
      <div
        ref={host}
        role="region"
        aria-label={label}
        dir="ltr"
        className="h-[72vh] min-h-[420px] w-full max-w-full overflow-x-hidden overflow-y-auto bg-white lg:h-[calc(100vh-7.5rem)] lg:min-h-[560px]"
      />
    </div>
  );
}
