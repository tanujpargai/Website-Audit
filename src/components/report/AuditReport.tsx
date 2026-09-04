"use client";

import { AuditResponseSuccess } from "@/lib/audit/types";
import { SITE_CONFIG } from "@/lib/config";
import ScoreRing, { getScoreLabel } from "./ScoreRing";
import CategoryScores from "./CategoryScores";
import TechnicalSnapshot from "./TechnicalSnapshot";
import ServiceRecommendations from "./ServiceRecommendations";

interface AuditReportProps {
  result: AuditResponseSuccess;
  onReset: () => void;
}

function Section({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="py-8 border-t border-zinc-800/60 first:border-t-0 first:pt-0">
      {children}
    </div>
  );
}

function ListSection({
  heading,
  items,
  variant = "neutral",
}: {
  heading: string;
  items: string[];
  variant?: "positive" | "negative" | "neutral";
}) {
  if (!items || items.length === 0) return null;
  const dotColor =
    variant === "positive" ? "bg-emerald-400" :
    variant === "negative" ? "bg-red-400" :
    "bg-indigo-400";
  return (
    <section aria-labelledby={`${heading.replace(/\s+/g, '-').toLowerCase()}-heading`}>
      <h2
        id={`${heading.replace(/\s+/g, '-').toLowerCase()}-heading`}
        className="text-lg font-semibold text-white mb-4"
      >
        {heading}
      </h2>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${dotColor}`} aria-hidden="true" />
            <span className="text-sm text-zinc-300 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AuditReport({ result, onReset }: AuditReportProps) {
  const { url, analyzedAt, technical, scores, ai } = result;
  const analyzedDate = new Date(analyzedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const { label: overallLabel, color: overallColor } = getScoreLabel(scores.overall);

  return (
    <div className="px-4 sm:px-6 pb-20">
      <div className="mx-auto max-w-4xl">
        {/* Report Navigation */}
        <nav
          className="flex gap-4 overflow-x-auto pb-1 mb-8 text-xs text-zinc-500 border-b border-zinc-800"
          aria-label="Report sections"
        >
          {[
            { href: "#overview", label: "Overview" },
            { href: "#scores", label: "Scores" },
            { href: "#insights", label: "Insights" },
            { href: "#improvements", label: "Improvements" },
            { href: "#signals", label: "Signals" },
            { href: "#how-we-help", label: "How We Can Help" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap py-2 hover:text-zinc-200 transition-colors focus-visible:outline-none focus-visible:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* OVERVIEW */}
        <Section id="overview">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
            <div className="flex-shrink-0">
              <ScoreRing score={scores.overall} size={150} strokeWidth={11} />
              <p className="mt-2 text-center text-xs text-zinc-500">Website Health Score</p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-4">
                <p className="text-xs text-zinc-500 mb-1">Audited URL</p>
                <p className="text-base font-semibold text-white truncate">{displayUrl}</p>
                <p className="text-xs text-zinc-600 mt-0.5">Analyzed {analyzedDate}</p>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-white">{scores.overall}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-600">100</span>
                <span className={`ml-2 text-sm font-medium ${overallColor}`}>{overallLabel}</span>
              </div>
              {ai.executiveSummary && (
                <p className="text-sm text-zinc-300 leading-relaxed">{ai.executiveSummary}</p>
              )}
            </div>
          </div>

          {/* Business context */}
          {(ai.businessType || ai.targetAudience) && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ai.businessType && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
                  <p className="text-xs text-zinc-500 mb-1">Business Type</p>
                  <p className="text-sm text-zinc-200">{ai.businessType}</p>
                </div>
              )}
              {ai.targetAudience && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
                  <p className="text-xs text-zinc-500 mb-1">Target Audience</p>
                  <p className="text-sm text-zinc-200">{ai.targetAudience}</p>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* CATEGORY SCORES */}
        <Section id="scores">
          <CategoryScores scores={scores} assessments={ai.assessments} />
        </Section>

        {/* INSIGHTS */}
        <div id="insights">
          <Section>
            <ListSection
              heading="Strengths"
              items={ai.strengths}
              variant="positive"
            />
          </Section>

          <Section>
            <ListSection
              heading="Major Weaknesses"
              items={ai.majorWeaknesses}
              variant="negative"
            />
          </Section>
        </div>

        {/* TOP IMPROVEMENTS */}
        <Section id="improvements">
          {ai.topImprovements && ai.topImprovements.length > 0 && (
            <section aria-labelledby="improvements-heading">
              <h2 id="improvements-heading" className="text-lg font-semibold text-white mb-5">
                Top Improvements
              </h2>
              <ol className="space-y-3">
                {ai.topImprovements.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-4"
                  >
                    <span
                      className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-400 mt-0.5"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm text-zinc-300 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </Section>

        {/* TECHNICAL SNAPSHOT */}
        <Section id="signals">
          <TechnicalSnapshot technical={technical} />
        </Section>

        {/* INTEGRAL LABS SERVICES */}
        <Section id="how-we-help">
          <ServiceRecommendations services={ai.integralLabsServices} />
        </Section>

        {/* FINAL CTA */}
        <Section>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-3">
              Ready to improve your website?
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
              We can help turn these findings into measurable improvements — from design and SEO to
              conversion optimization and performance.
            </p>
            <a
              href={SITE_CONFIG.CONTACT_URL}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-md transition-all hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              Talk to {SITE_CONFIG.companyName}
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </Section>

        {/* RUN ANOTHER AUDIT */}
        <div className="text-center pt-4">
          <button
            onClick={onReset}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-500 rounded px-2 py-1"
          >
            &larr; Audit another website
          </button>
        </div>
      </div>
    </div>
  );
}
