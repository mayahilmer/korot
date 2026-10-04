import assert from "node:assert/strict";
import test from "node:test";
import { buildCvHtml } from "../lib/cv-html.ts";
import { sampleCv, toView } from "../lib/model.ts";

const fontCss = "";

test("orders jobs from the latest and hides high school once a degree exists", () => {
  const view = toView(sampleCv("he"));
  assert.equal(view.jobs?.items[0]?.heading, "מנהלת תפעול");
  assert.equal(view.jobs?.items[1]?.heading, "רכזת תפעול");
  assert.match(view.jobs?.items[0]?.dates ?? "", /היום/);
  assert.equal(view.education?.items.length, 1);
  assert.match(view.education?.items[0]?.heading ?? "", /ניהול/);
  assert.equal(view.education?.items[0]?.lines.some((line) => line.text === "בהצטיינות"), true);
  assert.deepEqual(view.skills?.items, ["Office", "Excel", "Salesforce", "Python"]);
  assert.equal(view.languages?.items[0]?.level, "שפת אם");
});

test("escapes text and marks selected tools with V", () => {
  const cv = sampleCv("he");
  cv.personal.fullName = `נועה <script>`;
  cv.jobs[0].title = `תפקיד & "ציטוט"`;
  const html = buildCvHtml(toView(cv), { mode: "pdf", fontCss });
  assert.match(html, /נועה &lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /תפקיד &amp; &quot;ציטוט&quot;/);
  assert.equal(html.includes("תיכון עירוני"), false);
  assert.match(html, />V<\/span> Office/);
  assert.match(html, /dir="rtl"/);
});

test("an english document reads left to right", () => {
  const html = buildCvHtml(toView(sampleCv("en")), { mode: "preview", fontCss });
  assert.match(html, /dir="ltr"/);
  assert.match(html, /Experience/);
  assert.match(html, /With honors/);
});
