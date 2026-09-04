import { DeterministicScores, TechnicalData } from "./types";

export function calculateDeterministicScores(data: TechnicalData): DeterministicScores {
  let technicalScore = 100;
  const technicalFindings: string[] = [];

  // HTTPS check
  if (data.isHttps) {
    technicalFindings.push("Secure HTTPS connection is active and enforced.");
  } else {
    technicalScore -= 25;
    technicalFindings.push("Website is served over unencrypted HTTP, risking security warnings in modern browsers.");
  }

  // HTTP Status check
  if (data.httpStatus >= 200 && data.httpStatus < 300) {
    technicalFindings.push(`Server returned healthy HTTP status code (${data.httpStatus}).`);
  } else if (data.httpStatus >= 300 && data.httpStatus < 400) {
    technicalFindings.push(`Homepage redirected with status ${data.httpStatus}.`);
  } else {
    technicalScore -= 40;
    technicalFindings.push(`Server returned an error status code (${data.httpStatus}).`);
  }

  // Viewport check
  if (data.viewportMetaPresent) {
    technicalFindings.push("Mobile-responsive viewport meta tag is properly configured.");
  } else {
    technicalScore -= 20;
    technicalFindings.push("Missing viewport meta tag; website may fail to render responsively on mobile devices.");
  }

  // Canonical tag check
  if (data.canonicalUrl) {
    technicalFindings.push(`Canonical URL tag is specified (${data.canonicalUrl}).`);
  } else {
    technicalScore -= 10;
    technicalFindings.push("Missing canonical link tag; can lead to duplicate content indexing issues.");
  }

  // Robots meta check
  if (data.robotsMetaContent) {
    if (data.robotsMetaContent.toLowerCase().includes("noindex")) {
      technicalScore -= 30;
      technicalFindings.push(`Robots directive includes 'noindex' (${data.robotsMetaContent}), preventing search indexation.`);
    } else {
      technicalFindings.push(`Robots directive configured: ${data.robotsMetaContent}.`);
    }
  } else {
    technicalFindings.push("Standard default robots indexing allowed (no restrictive meta tag).");
  }

  // Open Graph presence
  if (data.openGraphPresent) {
    technicalFindings.push("Open Graph protocol tags detected for consistent social link rendering.");
  } else {
    technicalScore -= 10;
    technicalFindings.push("Missing Open Graph meta tags; social shares will lack rich previews.");
  }

  // Schema markup
  if (data.schemaMarkupPresent) {
    technicalFindings.push("JSON-LD structured data markup is embedded for search engine comprehension.");
  } else {
    technicalScore -= 10;
    technicalFindings.push("No JSON-LD structured data detected; search engines cannot easily parse entity information.");
  }

  technicalScore = Math.max(0, Math.min(100, technicalScore));

  // SEO Scoring
  let seoScore = 100;
  const seoFindings: string[] = [];

  // Title tag check
  if (!data.pageTitle) {
    seoScore -= 30;
    seoFindings.push("Missing <title> tag on the homepage.");
  } else {
    const len = data.pageTitle.length;
    if (len >= 30 && len <= 65) {
      seoFindings.push(`Page title length is optimal (${len} characters): "${data.pageTitle}".`);
    } else if (len < 30) {
      seoScore -= 10;
      seoFindings.push(`Page title is brief (${len} characters); consider adding brand or keyword context.`);
    } else {
      seoScore -= 10;
      seoFindings.push(`Page title is long (${len} characters) and may be truncated in search results.`);
    }
  }

  // Meta description check
  if (!data.metaDescription) {
    seoScore -= 25;
    seoFindings.push("Missing meta description; search engines will auto-generate arbitrary snippets.");
  } else {
    const len = data.metaDescription.length;
    if (len >= 70 && len <= 160) {
      seoFindings.push(`Meta description length is well-optimized (${len} characters).`);
    } else if (len < 70) {
      seoScore -= 10;
      seoFindings.push(`Meta description is short (${len} characters); consider elaborating on the core value proposition.`);
    } else {
      seoScore -= 10;
      seoFindings.push(`Meta description exceeds 160 characters (${len} characters) and risks truncation.`);
    }
  }

  // H1 structure
  if (data.h1Count === 0) {
    seoScore -= 25;
    seoFindings.push("No H1 heading found on page. A primary heading is essential for search topic indexing.");
  } else if (data.h1Count === 1) {
    seoFindings.push(`Optimal H1 heading structure: exactly 1 primary heading found ("${data.h1Texts[0]}").`);
  } else {
    seoScore -= 10;
    seoFindings.push(`Multiple H1 headings detected (${data.h1Count} found). Recommended to maintain a single H1 for clarity.`);
  }

  // H2 structure
  if (data.h2Count > 0) {
    seoFindings.push(`Logical content hierarchy supported by ${data.h2Count} H2 subheadings.`);
  } else if (data.wordCount > 120) {
    seoScore -= 10;
    seoFindings.push("No H2 subheadings found despite substantial page content; breaks content scannability.");
  }

  // Image alt coverage
  if (data.imageCount === 0) {
    seoFindings.push("No images present on homepage.");
  } else if (data.imagesWithoutAlt === 0) {
    seoFindings.push(`All ${data.imageCount} images have alt attributes specified.`);
  } else {
    const penalty = Math.min(20, Math.max(5, Math.round((data.imagesWithoutAlt / data.imageCount) * 20)));
    seoScore -= penalty;
    seoFindings.push(`${data.imagesWithoutAlt} of ${data.imageCount} images are completely missing alt attributes.`);
  }

  // Open Graph for SEO
  if (!data.openGraphPresent) {
    seoScore -= 10;
    seoFindings.push("Missing Open Graph tags, impacting social and conversational search discoverability.");
  }

  // Canonical for SEO
  if (!data.canonicalUrl) {
    seoScore -= 10;
    seoFindings.push("Missing canonical link tag, which helps prevent search index fragmentation.");
  }

  seoScore = Math.max(0, Math.min(100, seoScore));

  return {
    technicalScore,
    seoScore,
    technicalFindings,
    seoFindings,
  };
}
