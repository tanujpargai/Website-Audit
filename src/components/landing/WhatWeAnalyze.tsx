const categories = [
  {
    name: "Design",
    icon: "◈",
    description:
      "Visual hierarchy, branding consistency, layout clarity, and first-impression impact.",
  },
  {
    name: "UX",
    icon: "◎",
    description:
      "Navigation flow, friction points, information structure, and visitor journey signals.",
  },
  {
    name: "SEO",
    icon: "◉",
    description:
      "Title tags, meta descriptions, heading structure, canonical URLs, image alt text, and indexability.",
  },
  {
    name: "Content",
    icon: "◫",
    description:
      "Value proposition clarity, readability, messaging strength, and audience alignment.",
  },
  {
    name: "Conversion",
    icon: "◬",
    description:
      "Call-to-action visibility, lead capture signals, and next-step clarity for visitors.",
  },
  {
    name: "Performance Signals",
    icon: "◷",
    description:
      "Lightweight page signals including image usage, content density, and resource indicators.",
  },
  {
    name: "Technical",
    icon: "◦",
    description:
      "HTTPS configuration, viewport setup, Open Graph tags, structured data, and robots directives.",
  },
];

export default function WhatWeAnalyze() {
  return (
    <section className="border-t border-zinc-900 py-20 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Seven dimensions of website health
          </h2>
          <p className="mt-3 text-sm text-zinc-400 max-w-lg mx-auto">
            Each area is evaluated independently and scored so you know exactly
            where your website stands.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <div
              key={cat.name}
              className={`rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-5 transition-colors hover:border-zinc-700/80 ${
                i === categories.length - 1 && categories.length % 2 !== 0
                  ? "sm:col-span-2 lg:col-span-1"
                  : ""
              }`}
            >
              <div className="text-indigo-400 text-xl mb-3" aria-hidden="true">
                {cat.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{cat.name}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
