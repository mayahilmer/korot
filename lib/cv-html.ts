import type { CvItem, CvView } from "@/lib/types";
import { escapeHtml, htmlText } from "@/lib/text";

const CSS = `
  @page { size: A4; margin: 16mm 16mm 18mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #1c1915; }
  .sheet {
    font-size: 11pt;
    line-height: 1.45;
    font-synthesis: none;
    background: #fff;
    color: #1c1915;
    padding: 16mm 16mm 18mm;
  }
  .sheet.preview { min-height: 297mm; }
  .font-david { font-family: "CV David", David, "David Libre", "Times New Roman", serif; }
  .font-arial { font-family: "CV Arimo", Arial, Arimo, "Helvetica Neue", sans-serif; }
  @media print {
    .sheet { padding: 0; min-height: 0; }
  }
  a { color: inherit; text-decoration: none; border-bottom: 0.4pt solid #b7afa3; }
  .name {
    margin: 0;
    font-size: 20pt;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: 0;
    padding-bottom: 6px;
    border-bottom: 1.6pt solid #1c1915;
  }
  .name.ghost { color: #8a8175; font-weight: 500; }
  .contacts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px 28px;
    margin: 8px 0 0;
  }
  .contacts div { display: flex; gap: 8px; align-items: baseline; min-width: 0; }
  dt { margin: 0; color: #6b645c; }
  dd { margin: 0; overflow-wrap: anywhere; }
  section { margin-top: 15px; }
  h2 {
    margin: 0 0 7px;
    font-size: 12pt;
    font-weight: 700;
    line-height: 1.3;
    padding-bottom: 3px;
    border-bottom: 0.7pt solid #cfc6b8;
  }
  .item { margin: 0 0 10px; break-inside: avoid; page-break-inside: avoid; }
  .head { display: flex; justify-content: space-between; gap: 16px; align-items: baseline; }
  .title { font-weight: 700; }
  .dates { color: #3f3a34; white-space: nowrap; }
  .meta { color: #3f3a34; margin-top: 1px; }
  .line { margin: 2px 0 0; }
  .k { font-weight: 700; }
  .summary { margin: 0; }
  .chips, .langs { display: flex; flex-wrap: wrap; gap: 4px 16px; list-style: none; margin: 0; padding: 0; }
  .v { font-weight: 700; margin-inline-end: 0.3em; }
  .empty {
    min-height: 240mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 8px;
    color: #6b645c;
  }
  .empty strong {
    color: #1c1915;
    font-size: 20pt;
    font-weight: 700;
    letter-spacing: 0;
  }
  .empty p { margin: 0; max-width: 28em; }
`;

function itemHtml(item: CvItem): string {
  const heading = item.heading
    ? `<div class="title">${htmlText(item.heading)}</div>`
    : "";
  const dates = item.dates ? `<div class="dates">${htmlText(item.dates)}</div>` : "";
  const meta = item.meta ? `<div class="meta">${htmlText(item.meta)}</div>` : "";
  const lines = item.lines
    .map((line) => {
      const label = line.label ? `<span class="k">${htmlText(line.label)}. </span>` : "";
      return `<p class="line">${label}${htmlText(line.text)}</p>`;
    })
    .join("");
  return `<div class="item"><div class="head">${heading}${dates}</div>${meta}${lines}</div>`;
}

function section(title: string, body: string): string {
  return `<section><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

export function renderCv(
  view: CvView,
  options: { mode: "preview" | "pdf"; fontCss: string },
): { css: string; markup: string; html: string } {
  let body: string;
  if (view.empty && options.mode === "preview") {
    body = `<div class="empty"><strong>${escapeHtml(view.emptyTitle)}</strong><p>${escapeHtml(view.emptyBody)}</p></div>`;
  } else {
    const name = view.name
      ? `<h1 class="name">${htmlText(view.name)}</h1>`
      : options.mode === "preview"
        ? `<h1 class="name ghost">${escapeHtml(view.nameFallback)}</h1>`
        : "";
    const contacts = view.contacts.length
      ? `<dl class="contacts">${view.contacts
          .map((contact) => {
            const value = contact.href
              ? `<a href="${escapeHtml(contact.href)}">${htmlText(contact.value)}</a>`
              : htmlText(contact.value);
            return `<div><dt>${escapeHtml(contact.label)}</dt><dd>${value}</dd></div>`;
          })
          .join("")}</dl>`
      : "";
    const summary = view.summary
      ? section(
          view.summary.title,
          `<p class="summary">${htmlText(view.summary.text)}</p>`,
        )
      : "";
    const jobs = view.jobs
      ? section(view.jobs.title, view.jobs.items.map(itemHtml).join(""))
      : "";
    const education = view.education
      ? section(view.education.title, view.education.items.map(itemHtml).join(""))
      : "";
    const military = view.military
      ? section(view.military.title, view.military.items.map(itemHtml).join(""))
      : "";
    const skills = view.skills
      ? section(
          view.skills.title,
          `<ul class="chips">${view.skills.items
            .map((skill) => `<li><span class="v">V</span>${escapeHtml(skill)}</li>`)
            .join("")}</ul>`,
        )
      : "";
    const languages = view.languages
      ? section(
          view.languages.title,
          `<ul class="langs">${view.languages.items
            .map(
              (item) =>
                `<li><span class="k">${escapeHtml(item.name)}</span> — ${escapeHtml(item.level)}</li>`,
            )
            .join("")}</ul>`,
        )
      : "";
    body = `${name}${contacts}${summary}${jobs}${education}${military}${skills}${languages}`;
  }

  const sheetClass = `sheet${options.mode === "preview" ? " preview" : ""} font-${view.font}`;
  const markup = `<div class="${sheetClass}" dir="${view.dir}" lang="${view.lang}">${body}</div>`;
  const css = `${options.fontCss}\n${CSS}`;
  const html = `<!DOCTYPE html>
<html lang="${view.lang}" dir="${view.dir}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(view.name || view.emptyTitle)}</title>
<style>${css}</style>
</head>
<body>
${markup}
</body>
</html>`;
  return { css, markup, html };
}

export function buildCvHtml(
  view: CvView,
  options: { mode: "preview" | "pdf"; fontCss: string },
): string {
  return renderCv(view, options).html;
}
