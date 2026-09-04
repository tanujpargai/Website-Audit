import { NextRequest, NextResponse } from "next/server";
import { analyzeWebsiteWithGemini } from "@/lib/audit/gemini";
import { calculateDeterministicScores } from "@/lib/audit/scoring";
import { scrapeWebsite, validateSafeUrl } from "@/lib/audit/scraper";
import { AuditResponse, AuditScores } from "@/lib/audit/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse<AuditResponse>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_URL",
        message: "Invalid JSON body. Please provide a JSON object with a 'url' property.",
      },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || !("url" in body) || typeof (body as { url: unknown }).url !== "string") {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_URL",
        message: "The 'url' field is required and must be a valid string.",
      },
      { status: 400 }
    );
  }

  const rawUrl = (body as { url: string }).url.trim();

  // Validate URL and enforce SSRF protections
  const validation = await validateSafeUrl(rawUrl);
  if (!validation.valid || !validation.normalizedUrl) {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_URL",
        message: validation.error || "The submitted URL is invalid or restricted.",
      },
      { status: 400 }
    );
  }

  // Scrape homepage and extract objective technical measurements
  let technicalData;
  try {
    technicalData = await scrapeWebsite(validation.normalizedUrl);
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "FETCH_FAILED",
        message: "Unable to retrieve the website homepage. Please verify the URL is public and accessible.",
      },
      { status: 502 }
    );
  }

  // Compute deterministic technical and SEO scores
  const deterministicScores = calculateDeterministicScores(technicalData);

  // Qualitative AI interpretation via Gemini
  let aiAnalysis;
  try {
    aiAnalysis = await analyzeWebsiteWithGemini(technicalData, deterministicScores);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes("429") || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("rate limit")) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMITED",
          message: "The AI analysis service is temporarily rate-limited. Please retry in a few moments.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "ANALYSIS_FAILED",
        message: "AI qualitative analysis encountered an issue and could not be completed.",
      },
      { status: 500 }
    );
  }

  const scores: AuditScores = {
    overall: aiAnalysis.overallScore,
    design: aiAnalysis.assessments.design.score,
    ux: aiAnalysis.assessments.ux.score,
    seo: deterministicScores.seoScore,
    content: aiAnalysis.assessments.content.score,
    conversion: aiAnalysis.assessments.conversion.score,
    performanceSignals: aiAnalysis.assessments.performanceSignals.score,
    technical: deterministicScores.technicalScore,
  };

  return NextResponse.json({
    success: true,
    url: technicalData.resolvedUrl,
    analyzedAt: new Date().toISOString(),
    technical: technicalData,
    scores,
    ai: aiAnalysis,
  });
}
