import { TechnicalData } from "@/lib/audit/types";

interface TechnicalSnapshotProps {
  technical: TechnicalData;
}

type SignalStatus = "ok" | "warn" | "error" | "info";

interface Signal {
  label: string;
  value: string;
  status: SignalStatus;
}

function buildSignals(t: TechnicalData): Signal[] {
  const signals: Signal[] = [];

  signals.push({
    label: "Secure connection",
    value: t.isHttps ? "HTTPS active" : "HTTP only — not secure",
    status: t.isHttps ? "ok" : "error",
  });

  signals.push({
    label: "HTTP status",
    value: `${t.httpStatus}`,
    status: t.httpStatus >= 200 && t.httpStatus < 300 ? "ok" : "warn",
  });

  signals.push({
    label: "Page title",
    value: t.pageTitle ? `"${t.pageTitle.slice(0, 50)}${t.pageTitle.length > 50 ? '...' : ''}"` : "Missing",
    status: t.pageTitle ? (t.pageTitle.length >= 30 && t.pageTitle.length <= 65 ? "ok" : "warn") : "error",
  });

  signals.push({
    label: "Search description",
    value: t.metaDescription
      ? `${t.metaDescription.length} characters`
      : "Missing — search engines will auto-generate",
    status: t.metaDescription ? (t.metaDescription.length >= 70 && t.metaDescription.length <= 160 ? "ok" : "warn") : "error",
  });

  signals.push({
    label: "Primary heading (H1)",
    value:
      t.h1Count === 0 ? "None found" :
      t.h1Count === 1 ? `"${(t.h1Texts[0] ?? "").slice(0, 40)}${(t.h1Texts[0]?.length ?? 0) > 40 ? '...' : ''}"` :
      `${t.h1Count} H1s found (ideally 1)`,
    status: t.h1Count === 1 ? "ok" : "warn",
  });

  signals.push({
    label: "Subheadings (H2)",
    value: t.h2Count > 0 ? `${t.h2Count} found` : "None found",
    status: t.h2Count > 0 ? "ok" : "warn",
  });

  if (t.imageCount > 0) {
    signals.push({
      label: "Images missing descriptions",
      value:
        t.imagesWithoutAlt === 0
          ? `All ${t.imageCount} images have alt text`
          : `${t.imagesWithoutAlt} of ${t.imageCount} images missing alt`,
      status: t.imagesWithoutAlt === 0 ? "ok" : t.imagesWithoutAlt / t.imageCount < 0.4 ? "warn" : "error",
    });
  }

  signals.push({
    label: "Mobile viewport",
    value: t.viewportMetaPresent ? "Configured" : "Missing — may not display correctly on mobile",
    status: t.viewportMetaPresent ? "ok" : "error",
  });

  signals.push({
    label: "Social sharing metadata",
    value: t.openGraphPresent ? "Open Graph tags detected" : "Missing — social shares lack rich previews",
    status: t.openGraphPresent ? "ok" : "warn",
  });

  signals.push({
    label: "Structured data",
    value: t.schemaMarkupPresent ? "JSON-LD schema detected" : "None detected",
    status: t.schemaMarkupPresent ? "ok" : "info",
  });

  signals.push({
    label: "Canonical URL",
    value: t.canonicalUrl ? "Defined" : "Not specified",
    status: t.canonicalUrl ? "ok" : "warn",
  });

  signals.push({
    label: "Contact information",
    value: t.hasContactInfo
      ? t.contactSignals[0] ?? "Detected"
      : "No contact signals detected",
    status: t.hasContactInfo ? "ok" : "warn",
  });

  signals.push({
    label: "Conversion actions",
    value: t.hasCTA
      ? `${t.ctaSignals.length} CTA signal${t.ctaSignals.length !== 1 ? 's' : ''} detected`
      : "No CTA signals detected",
    status: t.hasCTA ? "ok" : "warn",
  });

  signals.push({
    label: "Approx. word count",
    value: `${t.wordCount} words`,
    status: t.wordCount > 150 ? "ok" : t.wordCount > 50 ? "warn" : "info",
  });

  if (t.socialLinks.length > 0) {
    signals.push({
      label: "Social media profiles",
      value: t.socialLinks.join(", "),
      status: "ok",
    });
  }

  return signals;
}

const statusConfig: Record<SignalStatus, { dot: string; label: string }> = {
  ok: { dot: "bg-emerald-400", label: "OK" },
  warn: { dot: "bg-amber-400", label: "Warning" },
  error: { dot: "bg-red-500", label: "Issue" },
  info: { dot: "bg-zinc-500", label: "Info" },
};

export default function TechnicalSnapshot({ technical }: TechnicalSnapshotProps) {
  const signals = buildSignals(technical);

  return (
    <section aria-labelledby="technical-snapshot-heading">
      <h2 id="technical-snapshot-heading" className="text-lg font-semibold text-white mb-5">
        Website Signals
      </h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
        <div className="divide-y divide-zinc-800/70">
          {signals.map((sig) => {
            const cfg = statusConfig[sig.status];
            return (
              <div
                key={sig.label}
                className="flex items-start justify-between gap-4 px-5 py-3.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${cfg.dot}`}
                    aria-label={cfg.label}
                  />
                  <span className="text-xs text-zinc-400 truncate">{sig.label}</span>
                </div>
                <span className="text-xs text-zinc-300 text-right max-w-[55%] leading-relaxed">
                  {sig.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
