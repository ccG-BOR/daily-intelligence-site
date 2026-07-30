import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPubMedSearchUrl,
  journalPriority,
  safePublicationDate,
  studentGuideFor,
  fallbackItems
} from "./update-feed.mjs";

test("builds a recent PubMed query for The Lancet journal family", () => {
  const url = new URL(buildPubMedSearchUrl({
    query: "Lancet [jour] OR Lancet Digital Health [jour]",
    days: 7,
    retmax: 12
  }));

  assert.equal(url.origin, "https://eutils.ncbi.nlm.nih.gov");
  assert.match(url.searchParams.get("term"), /Lancet \[jour\]/);
  assert.match(url.searchParams.get("term"), /"last 7 days"\[PDat\]/);
  assert.equal(url.searchParams.get("retmax"), "12");
  assert.equal(url.searchParams.get("sort"), "pub_date");
});

test("ranks The Lancet above supplementary medical indexes", () => {
  assert.ok(journalPriority("The Lancet") > journalPriority("JAMA"));
  assert.ok(journalPriority("JAMA") > journalPriority("PubMed indexed journal"));
});

test("uses collection time when an upstream issue date is implausibly future-dated", () => {
  const collectedAt = "2026-07-30T00:00:00.000Z";
  const result = safePublicationDate("2027 Jul 2", collectedAt);

  assert.equal(result.value, collectedAt);
  assert.equal(result.label, "collected");
});

test("gives educational videos a beginner-friendly watch guide", () => {
  assert.deepEqual(studentGuideFor("ai", "video"), {
    level: "intro",
    minutes: 12,
    actionZh: "先看视频了解概念，再打开原始链接延伸阅读。",
    actionEn: "Watch first for the concept, then use the original link to explore further."
  });
});

test("keeps medical papers at a guided-reading level", () => {
  const guide = studentGuideFor("health", "paper");

  assert.equal(guide.level, "guided");
  assert.equal(guide.minutes, 15);
});

test("keeps public educational videos available when a video feed is unavailable", () => {
  const videos = fallbackItems().filter((item) => item.sourceFormat === "video");

  assert.ok(videos.length >= 2);
  assert.ok(videos.every((item) => item.studentLevel === "intro"));
});
