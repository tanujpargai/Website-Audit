import { validateSafeUrl, scrapeWebsite, isPrivateIp } from "../src/lib/audit/scraper";
import { calculateDeterministicScores } from "../src/lib/audit/scoring";
import { validateAndFormatAiResponse } from "../src/lib/audit/gemini";
import { TechnicalData, APPROVED_SERVICES } from "../src/lib/audit/types";
import { POST } from "../src/app/api/audit/route";
import { NextRequest } from "next/server";

let totalPassed = 0;
let totalFailed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    totalPassed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ""}`);
    totalFailed++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("     RUNNING AUDIT ENGINE VERIFICATION TEST SUITE      ");
  console.log("=======================================================\n");

  // -------------------------------------------------------------
  // Test 1: Private IP & SSRF Protection
  // -------------------------------------------------------------
  console.log("[1] SSRF & Private IP Blocking Tests");
  assert(isPrivateIp("127.0.0.1"), "127.0.0.1 is identified as private");
  assert(isPrivateIp("10.0.0.1"), "10.0.0.1 is identified as private");
  assert(isPrivateIp("172.16.0.1"), "172.16.0.1 is identified as private");
  assert(isPrivateIp("192.168.1.100"), "192.168.1.100 is identified as private");
  assert(isPrivateIp("169.254.169.254"), "169.254.169.254 is identified as private");
  assert(isPrivateIp("::1"), "IPv6 ::1 is identified as private");
  assert(!isPrivateIp("8.8.8.8"), "8.8.8.8 is recognized as public");

  const localRes = await validateSafeUrl("http://localhost:3000");
  assert(!localRes.valid, "http://localhost:3000 is rejected");

  const loopbackRes = await validateSafeUrl("http://127.0.0.1");
  assert(!loopbackRes.valid, "http://127.0.0.1 is rejected");

  const metaRes = await validateSafeUrl("http://169.254.169.254/latest/meta-data");
  assert(!metaRes.valid, "Cloud metadata IP 169.254.169.254 is rejected");

  const ftpRes = await validateSafeUrl("ftp://example.com");
  assert(!ftpRes.valid, "FTP protocol is rejected");

  const normalizedRes = await validateSafeUrl("example.com");
  assert(normalizedRes.valid && normalizedRes.normalizedUrl === "https://example.com/", "example.com normalizes to https://example.com/");

  // -------------------------------------------------------------
  // Test 2: Invalid Domain & Nonexistent Domain
  // -------------------------------------------------------------
  console.log("\n[2] Nonexistent Domain & Error Handling");
  const badDomainRes = await validateSafeUrl("https://this-domain-does-not-exist-987654321012345.xyz");
  assert(!badDomainRes.valid, "Nonexistent domain fails DNS validation gracefully");

  // -------------------------------------------------------------
  // Test 3: Public HTTP Website (Unencrypted)
  // -------------------------------------------------------------
  console.log("\n[3] Public HTTP (Non-HTTPS) Website Test");
  try {
    const httpData = await scrapeWebsite("http://info.cern.ch");
    assert(!httpData.isHttps, "info.cern.ch correctly identified as HTTP (not HTTPS)");
    assert(httpData.httpStatus === 200, `info.cern.ch returned HTTP ${httpData.httpStatus}`);
    assert(httpData.pageTitle !== null, `info.cern.ch has title: "${httpData.pageTitle}"`);
    const httpScores = calculateDeterministicScores(httpData);
    assert(httpScores.technicalScore <= 75, `HTTP penalty applied in technicalScore (${httpScores.technicalScore}/100)`);
    assert(httpScores.technicalFindings.some(f => f.includes("unencrypted HTTP")), "Technical findings report unencrypted HTTP");
  } catch (err) {
    console.warn("  ! Note: Network access to info.cern.ch skipped or timed out:", err);
  }

  // -------------------------------------------------------------
  // Test 4: Real Public Website Scraping & Extraction
  // -------------------------------------------------------------
  console.log("\n[4] Real Public Website Scraping (https://example.com)");
  try {
    const exampleData = await scrapeWebsite("https://example.com");
    assert(exampleData.isHttps, "example.com is HTTPS");
    assert(exampleData.httpStatus === 200, "example.com returned 200 OK");
    assert(exampleData.pageTitle === "Example Domain", `example.com title is "${exampleData.pageTitle}"`);
    assert(exampleData.h1Count === 1, "example.com has exactly 1 H1");
    assert(exampleData.headingStructureValid, "Heading structure is valid");
    assert(exampleData.internalLinkCount > 0 || exampleData.externalLinkCount > 0, "Links were extracted");
    assert(exampleData.wordCount > 10, `Extracted visible words (~${exampleData.wordCount})`);

    const exampleScores = calculateDeterministicScores(exampleData);
    assert(exampleScores.technicalScore > 50, `Deterministic technical score: ${exampleScores.technicalScore}`);
    assert(exampleScores.seoScore > 40, `Deterministic SEO score: ${exampleScores.seoScore}`);
  } catch (err) {
    console.warn("  ! Note: Network fetch to example.com timed out:", err);
  }

  console.log("\n[4b] Real Website with Images (https://news.ycombinator.com)");
  try {
    const hnData = await scrapeWebsite("https://news.ycombinator.com");
    assert(hnData.imageCount > 0, `Extracted ${hnData.imageCount} images from news.ycombinator.com`);
    assert(hnData.internalLinkCount > 20, `Extracted ${hnData.internalLinkCount} internal links`);
    const hnScores = calculateDeterministicScores(hnData);
    assert(typeof hnScores.seoScore === "number", `Calculated SEO score: ${hnScores.seoScore}`);
    assert(typeof hnScores.technicalScore === "number", `Calculated Technical score: ${hnScores.technicalScore}`);
  } catch (err) {
    console.warn("  ! Note: Network fetch to news.ycombinator.com timed out:", err);
  }

  // -------------------------------------------------------------
  // Test 5: Synthetic HTML Edge Cases (Missing alt vs decorative alt="", missing metadata, CTAs)
  // -------------------------------------------------------------
  console.log("\n[5] Synthetic Data & Deterministic Scoring Edge Cases");
  const syntheticData: TechnicalData = {
    resolvedUrl: "https://synthetic-test.example.com",
    isHttps: true,
    httpStatus: 200,
    pageTitle: "Short", // too short (< 30)
    metaDescription: null, // missing meta description (-25)
    canonicalUrl: null, // missing canonical (-10)
    h1Count: 0, // missing H1 (-25)
    h1Texts: [],
    h2Count: 0,
    h2Texts: [],
    headingStructureValid: false,
    imageCount: 10,
    imagesWithoutAlt: 5, // missing alt on 50% of images
    internalLinkCount: 4,
    externalLinkCount: 2,
    wordCount: 250,
    hasContactInfo: true,
    contactSignals: ["Email link detected (mailto:)", "Form element detected on homepage"],
    hasCTA: true,
    ctaSignals: ["Get Started", "Contact Us"],
    socialLinks: ["LinkedIn", "Twitter/X"],
    robotsMetaContent: null,
    viewportMetaPresent: true,
    openGraphPresent: false, // missing Open Graph (-10)
    schemaMarkupPresent: false, // missing Schema (-10)
    visibleTextSample: "Sample visible text for testing.",
  };

  const syntheticScores = calculateDeterministicScores(syntheticData);
  assert(syntheticScores.seoScore < 50, `Poorly optimized SEO scores penalized correctly: ${syntheticScores.seoScore}/100`);
  assert(syntheticScores.seoFindings.some(f => f.includes("Missing <title>") || f.includes("brief")), "Short title penalty noted in findings");
  assert(syntheticScores.seoFindings.some(f => f.includes("Missing meta description")), "Missing meta description noted in findings");
  assert(syntheticScores.seoFindings.some(f => f.includes("No H1 heading found")), "Missing H1 noted in findings");
  assert(syntheticScores.seoFindings.some(f => f.includes("images are completely missing alt")), "Missing image alt noted in findings");

  // -------------------------------------------------------------
  // Test 6: AI Validation, Authoritative Scoring & Whitelist Enforcement
  // -------------------------------------------------------------
  console.log("\n[6] AI Response Validation & Sanitization Tests");
  const mockAiOutput = {
    businessType: "B2B SaaS Platform",
    targetAudience: "Engineering leaders and founders",
    executiveSummary: "Your website has a clear technical foundation, but conversion paths are under-optimized.",
    assessments: {
      design: { score: 75, summary: "Clean modern design.", findings: ["Good contrast", "Consistent fonts"] },
      ux: { score: 70, summary: "Intuitive flow.", findings: ["Straightforward navigation"] },
      seo: { score: 999, summary: "AI tried to override SEO.", findings: ["Should be ignored for score"] }, // Out of range and should use deterministic
      content: { score: 80, summary: "Strong copywriting.", findings: ["Value proposition clear"] },
      conversion: { score: 60, summary: "Weak CTAs.", findings: ["Main CTA below fold"] },
      performanceSignals: { score: 85, summary: "Lightweight asset footprints.", findings: ["Few heavy scripts"] },
      technical: { score: -50, summary: "AI tried to override technical.", findings: ["Should be ignored for score"] },
    },
    strengths: ["Strong branding", "HTTPS active"],
    majorWeaknesses: ["Missing meta descriptions", "Weak hero CTA"],
    topImprovements: ["Add prominent Get Started button", "Optimize meta tags"],
    integralLabsServices: [
      { service: "Conversion Rate Optimization", reason: "Directly solves the weak CTA and conversion friction." },
      { service: "Bogus Fake Service", reason: "Should be filtered out!" },
      { service: "UI/UX Improvement", reason: "Enhance visual flow." },
    ],
  };

  const validatedAi = validateAndFormatAiResponse(mockAiOutput, syntheticScores, syntheticData);

  // Check that SEO and Technical scores match deterministic scores strictly
  assert(
    validatedAi.assessments.seo.score === syntheticScores.seoScore,
    `SEO score matches deterministic score (${validatedAi.assessments.seo.score} === ${syntheticScores.seoScore})`
  );
  assert(
    validatedAi.assessments.technical.score === syntheticScores.technicalScore,
    `Technical score matches deterministic score (${validatedAi.assessments.technical.score} === ${syntheticScores.technicalScore})`
  );

  // Check authoritative overall score calculation
  // Formula: Design 15%, UX 20%, SEO 20%, Content 15%, Conversion 15%, Performance 5%, Technical 10%
  const expectedOverall = Math.round(
    validatedAi.assessments.design.score * 0.15 +
    validatedAi.assessments.ux.score * 0.20 +
    validatedAi.assessments.seo.score * 0.20 +
    validatedAi.assessments.content.score * 0.15 +
    validatedAi.assessments.conversion.score * 0.15 +
    validatedAi.assessments.performanceSignals.score * 0.05 +
    validatedAi.assessments.technical.score * 0.10
  );
  assert(
    validatedAi.overallScore === expectedOverall,
    `Authoritative server overall score matches formula: ${validatedAi.overallScore} === ${expectedOverall}`
  );

  // Check approved services filtering
  const allServicesApproved = validatedAi.integralLabsServices.every(s =>
    APPROVED_SERVICES.includes(s.service)
  );
  assert(allServicesApproved, "All recommended services strictly belong to APPROVED_SERVICES whitelist");
  assert(!validatedAi.integralLabsServices.some(s => (s.service as string) === "Bogus Fake Service"), "Unapproved service 'Bogus Fake Service' was filtered out");

  // -------------------------------------------------------------
  // Test 7: API Route Handler Direct Testing
  // -------------------------------------------------------------
  console.log("\n[7] API Route Integration Tests (POST /api/audit)");

  // 7a. Invalid JSON body
  const badReq1 = new NextRequest("http://localhost:3000/api/audit", {
    method: "POST",
    body: JSON.stringify({}),
  });
  const res1 = await POST(badReq1);
  assert(res1.status === 400, "Missing 'url' returns HTTP 400");
  const json1 = await res1.json();
  assert(json1.error === "INVALID_URL", "Returns INVALID_URL error code");

  // 7b. SSRF Attempt
  const badReq2 = new NextRequest("http://localhost:3000/api/audit", {
    method: "POST",
    body: JSON.stringify({ url: "http://127.0.0.1:8080" }),
  });
  const res2 = await POST(badReq2);
  assert(res2.status === 400, "SSRF attempt returns HTTP 400");
  const json2 = await res2.json();
  assert(json2.error === "INVALID_URL", "SSRF attempt returns INVALID_URL error code");

  // 7c. Nonexistent domain
  const badReq3 = new NextRequest("http://localhost:3000/api/audit", {
    method: "POST",
    body: JSON.stringify({ url: "https://domain-definitely-does-not-exist-123456.org" }),
  });
  const res3 = await POST(badReq3);
  assert(res3.status === 400 || res3.status === 502, `Unreachable domain returns error status (${res3.status})`);

  console.log("\n=======================================================");
  console.log(`TEST SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log("=======================================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
