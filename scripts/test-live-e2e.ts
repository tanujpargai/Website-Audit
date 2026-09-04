import { scrapeWebsite } from "../src/lib/audit/scraper";
import { calculateDeterministicScores } from "../src/lib/audit/scoring";
import { analyzeWebsiteWithGemini } from "../src/lib/audit/gemini";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2].trim();
}

async function runLiveE2E() {
  console.log("1. Scraping https://example.com...");
  const technical = await scrapeWebsite("https://example.com");
  console.log("   Scraped successfully. Resolved URL:", technical.resolvedUrl, "Title:", technical.pageTitle);

  console.log("2. Calculating deterministic scores...");
  const scores = calculateDeterministicScores(technical);
  console.log("   Tech Score:", scores.technicalScore, "SEO Score:", scores.seoScore);

  console.log("3. Invoking Gemini AI qualitative analysis...");
  const ai = await analyzeWebsiteWithGemini(technical, scores);
  console.log("\n=================== LIVE AUDIT REPORT ===================");
  console.log("Business Type:", ai.businessType);
  console.log("Target Audience:", ai.targetAudience);
  console.log("Executive Summary:", ai.executiveSummary);
  console.log("Overall Score:", ai.overallScore, "/ 100");
  console.log("Scores: Design:", ai.assessments.design.score, "UX:", ai.assessments.ux.score, "SEO:", scores.seoScore, "Content:", ai.assessments.content.score, "Conversion:", ai.assessments.conversion.score, "Performance:", ai.assessments.performanceSignals.score, "Technical:", scores.technicalScore);
  console.log("\nKey Strengths:", ai.strengths);
  console.log("\nMajor Weaknesses:", ai.majorWeaknesses);
  console.log("\nTop Improvements:", ai.topImprovements);
  console.log("\nIntegral Labs Recommended Services:", ai.integralLabsServices);
  console.log("=========================================================\n");
}

runLiveE2E().catch(err => {
  console.error("Live E2E Failed:", err);
  process.exit(1);
});
