import { SITE_CONFIG } from "@/lib/config";

const services = [
  "Website Redesign",
  "UI/UX Improvement",
  "SEO Optimization",
  "Conversion Rate Optimization",
  "Performance Optimization",
  "Landing Page Development",
  "Content Strategy",
  "Technical Audit & Fixes",
];

export default function IntegralLabsSection() {
  return (
    <section className="border-t border-zinc-900 py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-4">
          Found opportunities?
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Turn them into improvements with {SITE_CONFIG.companyName}
        </h2>
        <p className="mt-4 text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
          Once you understand what to fix, our team can help you act on it.
          {" "}{SITE_CONFIG.companyName} implements improvements across design, development, SEO,
          conversion, and content — informed by audit findings, not guesswork.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {services.map((s) => (
            <span
              key={s}
              className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400"
            >
              {s}
            </span>
          ))}
        </div>
        <a
          href={SITE_CONFIG.CONTACT_URL}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-lg transition-all hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          Talk to {SITE_CONFIG.companyName}
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </section>
  );
}
