const pillars = [
  {
    label: "Objective Measurement",
    detail:
      "Our scanner extracts raw page data — headings, images, meta tags, links — without guessing.",
  },
  {
    label: "Deterministic Scoring",
    detail:
      "Technical and SEO scores are calculated by rule-based logic, not estimated by AI.",
  },
  {
    label: "AI Qualitative Analysis",
    detail:
      "Google Gemini interprets the extracted data to understand your business, audience, and positioning.",
  },
];

export default function WhyDifferent() {
  return (
    <section className="border-t border-zinc-900 py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Analysis that actually understands your website
            </h2>
            <p className="mt-4 text-zinc-400 text-sm leading-relaxed">
              Most tools check boxes. This audit combines real data extraction with
              AI interpretation — giving you findings a developer and a consultant
              would give you together.
            </p>
            <div className="mt-8 space-y-5">
              {pillars.map((p) => (
                <div key={p.label} className="flex items-start gap-3">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{p.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{p.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Example findings</p>
            {[
              { type: "warning", text: 'Your primary CTA is difficult to identify above the fold.' },
              { type: "error", text: 'The homepage is missing a meta description for search engines.' },
              { type: "info", text: 'The site communicates its offering clearly, but the conversion path could be stronger.' },
              { type: "ok", text: 'HTTPS is active and the site loads over a secure connection.' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3"
              >
                <span
                  className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                    item.type === 'error' ? 'bg-red-500' :
                    item.type === 'warning' ? 'bg-amber-400' :
                    item.type === 'ok' ? 'bg-emerald-400' :
                    'bg-indigo-400'
                  }`}
                  aria-hidden="true"
                />
                <p className="text-xs text-zinc-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
