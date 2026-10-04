import assert from "node:assert/strict";
import test from "node:test";
import { arrangeSummary, summaryLineCount } from "../lib/arrange-summary.ts";

test("keeps three finished sentences on three lines", () => {
  const input = "מנהלת תפעול עם ניסיון בצוותים. צמצמתי זמני אספקה. אני עובדת מול ספקים.";
  const output = arrangeSummary(input);
  assert.equal(summaryLineCount(output), 3);
  assert.match(output, /מנהלת תפעול/);
  assert.match(output, /ספקים/);
});

test("turns extra bullets into four lines without new facts", () => {
  const input = ["אחת", "שתיים", "שלוש", "ארבע", "חמש"].join("\n");
  const output = arrangeSummary(input);
  assert.equal(summaryLineCount(output), 4);
  assert.match(output, /ארבע; חמש/);
  assert.doesNotMatch(output, /מנהל/);
});

test("returns an empty string for blank notes", () => {
  assert.equal(arrangeSummary("  \n  "), "");
});
