import { RecommendedService } from "@/lib/audit/types";
import { SITE_CONFIG } from "@/lib/config";

interface ServiceRecommendationsProps {
  services: RecommendedService[];
}

export default function ServiceRecommendations({ services }: ServiceRecommendationsProps) {
  if (!services || services.length === 0) return null;

  return (
    <section aria-labelledby="services-heading">
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/30 to-zinc-950 p-6 sm:p-8">
        <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-2">
          How We Can Help
        </p>
        <h2 id="services-heading" className="text-lg font-semibold text-white mb-1">
          Recommended services for{" "}
          <span className="text-indigo-300">{SITE_CONFIG.companyName}</span>
        </h2>
        <p className="text-sm text-zinc-500 mb-8">
          Based on the actual audit findings above, these are the improvements we can help you implement.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((svc) => (
            <div
              key={svc.service}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"
            >
              <h3 className="text-sm font-semibold text-white mb-2">{svc.service}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">{svc.reason}</p>
              <a
                href={SITE_CONFIG.CONTACT_URL}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 rounded"
              >
                Talk to {SITE_CONFIG.companyName}
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
