export interface TechnicalData {
  resolvedUrl: string;
  isHttps: boolean;
  httpStatus: number;
  pageTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  h1Count: number;
  h1Texts: string[];
  h2Count: number;
  h2Texts: string[];
  headingStructureValid: boolean;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinkCount: number;
  externalLinkCount: number;
  wordCount: number;
  hasContactInfo: boolean;
  contactSignals: string[];
  hasCTA: boolean;
  ctaSignals: string[];
  socialLinks: string[];
  robotsMetaContent: string | null;
  viewportMetaPresent: boolean;
  openGraphPresent: boolean;
  schemaMarkupPresent: boolean;
  visibleTextSample: string;
}

export interface DeterministicScores {
  technicalScore: number;
  seoScore: number;
  technicalFindings: string[];
  seoFindings: string[];
}

export const APPROVED_SERVICES = [
  "Website Redesign",
  "UI/UX Improvement",
  "SEO Optimization",
  "Performance Optimization",
  "Conversion Rate Optimization",
  "Landing Page Development",
  "Web Application Development",
  "Content Strategy",
  "Technical Audit & Fixes",
] as const;

export type ApprovedService = (typeof APPROVED_SERVICES)[number];

export interface RecommendedService {
  service: ApprovedService;
  reason: string;
}

export interface AssessmentCategory {
  score: number;
  summary: string;
  findings: string[];
}

export interface AiAssessments {
  design: AssessmentCategory;
  ux: AssessmentCategory;
  seo: AssessmentCategory;
  content: AssessmentCategory;
  conversion: AssessmentCategory;
  performanceSignals: AssessmentCategory;
  technical: AssessmentCategory;
}

export interface AiAnalysis {
  businessType: string;
  targetAudience: string;
  executiveSummary: string;
  assessments: AiAssessments;
  overallScore: number;
  strengths: string[];
  majorWeaknesses: string[];
  topImprovements: string[];
  integralLabsServices: RecommendedService[];
}

export interface AuditScores {
  overall: number;
  design: number;
  ux: number;
  seo: number;
  content: number;
  conversion: number;
  performanceSignals: number;
  technical: number;
}

export interface AuditResponseSuccess {
  success: true;
  url: string;
  analyzedAt: string;
  technical: TechnicalData;
  scores: AuditScores;
  ai: AiAnalysis;
}

export type AuditErrorCode =
  | "INVALID_URL"
  | "FETCH_FAILED"
  | "ANALYSIS_FAILED"
  | "RATE_LIMITED";

export interface AuditResponseError {
  success: false;
  error: AuditErrorCode;
  message: string;
}

export type AuditResponse = AuditResponseSuccess | AuditResponseError;
