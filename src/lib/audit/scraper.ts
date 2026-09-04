import * as cheerio from "cheerio";
import dns from "node:dns/promises";
import net from "node:net";
import { TechnicalData } from "./types";

export function isPrivateIp(ip: string): boolean {
  if (!net.isIP(ip)) return true;
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4) return true;
    if (parts[0] === 0) return true;
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    if (parts[0] === 192 && parts[1] === 0 && (parts[2] === 0 || parts[2] === 2)) return true;
    if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) return true;
    if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("fe80:")) return true;
    if (lower.startsWith("::ffff:")) {
      const v4Part = lower.replace("::ffff:", "");
      return isPrivateIp(v4Part);
    }
    return false;
  }
  return true;
}

export async function validateSafeUrl(rawUrl: string): Promise<{ valid: boolean; normalizedUrl?: string; error?: string }> {
  let urlString = rawUrl.trim();
  if (!urlString) {
    return { valid: false, error: "URL cannot be empty" };
  }

  if (!/^https?:\/\//i.test(urlString)) {
    urlString = `https://${urlString}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { valid: false, error: "Only http and https protocols are allowed" };
  }

  const hostname = parsed.hostname;
  if (!hostname || hostname.includes("..")) {
    return { valid: false, error: "Invalid hostname" };
  }

  const lowerHost = hostname.toLowerCase();
  if (
    lowerHost === "localhost" ||
    lowerHost.endsWith(".local") ||
    lowerHost.endsWith(".internal") ||
    lowerHost.endsWith(".lan") ||
    lowerHost.endsWith(".home") ||
    lowerHost === "127.0.0.1" ||
    lowerHost === "0.0.0.0" ||
    lowerHost === "::1"
  ) {
    return { valid: false, error: "Access to private or local addresses is prohibited" };
  }

  if (net.isIP(lowerHost)) {
    if (isPrivateIp(lowerHost)) {
      return { valid: false, error: "Direct access to private IP ranges is prohibited" };
    }
  } else {
    try {
      const addresses = await dns.lookup(lowerHost, { all: true });
      if (!addresses || addresses.length === 0) {
        return { valid: false, error: "Could not resolve hostname" };
      }
      for (const record of addresses) {
        if (isPrivateIp(record.address)) {
          return { valid: false, error: "Hostname resolves to a restricted private IP address" };
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "DNS resolution failed";
      return { valid: false, error: `Domain not found: ${message}` };
    }
  }

  return { valid: true, normalizedUrl: parsed.toString() };
}

async function fetchWithLimit(url: string, timeoutMs = 12000, maxBytes = 3 * 1024 * 1024): Promise<{ response: Response; html: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 WebsiteAudit/1.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      throw new Error("Target page exceeds maximum allowed size (3MB)");
    }

    if (!res.body) {
      const text = await res.text();
      return { response: res, html: text };
    }

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        receivedBytes += value.length;
        if (receivedBytes > maxBytes) {
          controller.abort();
          throw new Error("Target page exceeds maximum allowed size (3MB)");
        }
        chunks.push(value);
      }
    }

    const merged = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    const html = new TextDecoder("utf-8").decode(merged);
    return { response: res, html };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function scrapeWebsite(targetUrl: string): Promise<TechnicalData> {
  const validation = await validateSafeUrl(targetUrl);
  if (!validation.valid || !validation.normalizedUrl) {
    throw new Error(validation.error || "Invalid URL");
  }

  const { response, html } = await fetchWithLimit(validation.normalizedUrl);

  const resolvedUrl = response.url || validation.normalizedUrl;
  const isHttps = resolvedUrl.startsWith("https://");
  const httpStatus = response.status;

  const $ = cheerio.load(html);

  // Title & Metadata
  const pageTitle = $("title").first().text().trim() || null;
  const metaDescription =
    $('meta[name="description" i]').attr("content")?.trim() ||
    $('meta[property="og:description" i]').attr("content")?.trim() ||
    null;
  const canonicalUrl = $('link[rel="canonical" i]').attr("href")?.trim() || null;

  // Headings
  const h1Elements = $("h1");
  const h1Texts: string[] = [];
  h1Elements.each((_, el) => {
    const t = $(el).text().trim().replace(/\s+/g, " ");
    if (t && h1Texts.length < 10) h1Texts.push(t);
  });
  const h1Count = h1Elements.length;

  const h2Elements = $("h2");
  const h2Texts: string[] = [];
  h2Elements.each((_, el) => {
    const t = $(el).text().trim().replace(/\s+/g, " ");
    if (t && h2Texts.length < 15) h2Texts.push(t);
  });
  const h2Count = h2Elements.length;

  // Heading structure validity: Exactly 1 H1 is optimal
  const headingStructureValid = h1Count === 1;

  // Images & Alt
  const imgElements = $("img");
  const imageCount = imgElements.length;
  let imagesWithoutAlt = 0;
  imgElements.each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt === undefined) {
      imagesWithoutAlt++;
    }
  });

  // Internal and External Links
  const internalLinks = new Set<string>();
  const externalLinks = new Set<string>();
  let baseOrigin: string;
  try {
    baseOrigin = new URL(resolvedUrl).origin;
  } catch {
    baseOrigin = "";
  }

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (!href) return;
    const lower = href.toLowerCase();
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("mailto:") ||
      lower.startsWith("tel:") ||
      lower.startsWith("#")
    ) {
      return;
    }
    try {
      const parsed = new URL(href, resolvedUrl);
      if (parsed.origin === baseOrigin) {
        internalLinks.add(parsed.href);
      } else if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        externalLinks.add(parsed.href);
      }
    } catch {
      // Ignore invalid URLs
    }
  });

  const internalLinkCount = internalLinks.size;
  const externalLinkCount = externalLinks.size;

  // Clean body text for analysis
  const cleanBody = $("body").clone();
  cleanBody.find("script, style, noscript, svg, iframe, canvas, template, head").remove();
  const rawVisibleText = cleanBody.text().replace(/\s+/g, " ").trim();
  const wordCount = rawVisibleText ? rawVisibleText.split(" ").filter(Boolean).length : 0;
  const visibleTextSample = rawVisibleText.slice(0, 1500);

  // Contact signals
  const contactSignals: string[] = [];
  let hasContactInfo = false;

  if ($('a[href^="tel:"]').length > 0) {
    hasContactInfo = true;
    contactSignals.push("Telephone link detected (tel:)");
  }
  if ($('a[href^="mailto:"]').length > 0) {
    hasContactInfo = true;
    contactSignals.push("Email link detected (mailto:)");
  }

  const emailMatches = rawVisibleText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (emailMatches && emailMatches.length > 0) {
    hasContactInfo = true;
    contactSignals.push(`Visible email address detected (${emailMatches[0]})`);
  }

  const phoneMatches = rawVisibleText.match(/(?:\+?\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/g);
  if (phoneMatches && phoneMatches.length > 0) {
    hasContactInfo = true;
    contactSignals.push("Visible telephone number pattern detected");
  }

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.toLowerCase() || "";
    const text = $(el).text().toLowerCase();
    if (href.includes("contact") || text.includes("contact")) {
      hasContactInfo = true;
      if (!contactSignals.includes("Contact page navigation link detected")) {
        contactSignals.push("Contact page navigation link detected");
      }
    }
  });

  if ($("form").length > 0) {
    hasContactInfo = true;
    contactSignals.push("Interactive form element detected on homepage");
  }

  // CTA Signals
  const ctaKeywords = [
    "get started",
    "contact us",
    "book a call",
    "request a quote",
    "schedule",
    "buy now",
    "sign up",
    "learn more",
    "start now",
    "get quote",
    "free trial",
    "try for free",
    "book demo",
    "join now",
    "subscribe",
  ];
  const ctaSignals: string[] = [];
  $('button, a, input[type="submit"], input[type="button"], [role="button"]').each((_, el) => {
    const text = ($(el).text() || $(el).attr("value") || "").trim().toLowerCase().replace(/\s+/g, " ");
    if (!text || text.length > 30) return;
    for (const kw of ctaKeywords) {
      if (text.includes(kw)) {
        const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
        if (!ctaSignals.includes(capitalized) && ctaSignals.length < 8) {
          ctaSignals.push(capitalized);
        }
        break;
      }
    }
  });
  const hasCTA = ctaSignals.length > 0;

  // Social Links
  const socialPlatforms: { name: string; match: RegExp }[] = [
    { name: "Twitter/X", match: /(?:twitter\.com|x\.com)/i },
    { name: "LinkedIn", match: /linkedin\.com/i },
    { name: "GitHub", match: /github\.com/i },
    { name: "Facebook", match: /facebook\.com/i },
    { name: "Instagram", match: /instagram\.com/i },
    { name: "YouTube", match: /youtube\.com/i },
    { name: "TikTok", match: /tiktok\.com/i },
  ];
  const detectedSocial = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    for (const plat of socialPlatforms) {
      if (plat.match.test(href)) {
        detectedSocial.add(plat.name);
      }
    }
  });
  const socialLinks = Array.from(detectedSocial);

  // Metadata directives
  const robotsMetaContent = $('meta[name="robots" i]').attr("content")?.trim() || null;
  const viewportMetaPresent = $('meta[name="viewport" i]').length > 0;
  const openGraphPresent = $('meta[property^="og:" i]').length > 0;
  const schemaMarkupPresent = $('script[type="application/ld+json"]').length > 0;

  return {
    resolvedUrl,
    isHttps,
    httpStatus,
    pageTitle,
    metaDescription,
    canonicalUrl,
    h1Count,
    h1Texts,
    h2Count,
    h2Texts,
    headingStructureValid,
    imageCount,
    imagesWithoutAlt,
    internalLinkCount,
    externalLinkCount,
    wordCount,
    hasContactInfo,
    contactSignals,
    hasCTA,
    ctaSignals,
    socialLinks,
    robotsMetaContent,
    viewportMetaPresent,
    openGraphPresent,
    schemaMarkupPresent,
    visibleTextSample,
  };
}
