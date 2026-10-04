import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { buildDocx } from "../lib/cv-docx.ts";
import { sampleCv, toView } from "../lib/model.ts";

test("word file is right to left and leaves high school out", async () => {
  const buffer = await buildDocx(toView(sampleCv("he")));
  const dir = mkdtempSync(path.join(tmpdir(), "korot-"));
  const file = path.join(dir, "cv.docx");
  writeFileSync(file, buffer);
  execFileSync("unzip", ["-o", file, "-d", path.join(dir, "out")], { stdio: "ignore" });
  const xml = readFileSync(path.join(dir, "out", "word", "document.xml"), "utf8");
  assert.match(xml, /נועה ברק/);
  assert.match(xml, /שקד לוגיסטיקה/);
  assert.match(xml, /<w:bidi\/>|<w:bidi w:val="true"\/>|<w:bidi w:val="1"\/>/);
  assert.match(xml, /<w:rtl\/>|<w:rtl w:val="true"\/>|<w:rtl w:val="1"\/>/);
  assert.match(xml, /David/);
  assert.equal(xml.includes("תיכון עירוני"), false);
  assert.match(xml, /בהצטיינות/);
});
