"use client";

import { useEffect, useState } from "react";

const messages = [
  "Fetching website homepage...",
  "Checking technical structure...",
  "Reviewing SEO signals...",
  "Extracting content and links...",
  "Evaluating user experience signals...",
  "Assessing conversion opportunities...",
  "Running AI qualitative analysis...",
  "Generating recommendations...",
];

export default function ScanningState({ url }: { url: string }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1 < messages.length ? i + 1 : i));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <section className="py-24 px-4 flex flex-col items-center justify-center min-h-[40vh]" aria-live="polite" aria-label="Audit in progress">
      {/* Spinner ring */}
      <div className="relative mb-8">
        <div className="h-16 w-16 rounded-full border-4 border-zinc-800" aria-hidden="true" />
        <div
          className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin"
          aria-hidden="true"
        />
        <div
          className="absolute inset-3 h-10 w-10 rounded-full border-2 border-transparent border-t-violet-400 animate-spin [animation-duration:1.5s]"
          aria-hidden="true"
        />
      </div>

      <h2 className="text-lg font-semibold text-white mb-1">Analyzing your website</h2>
      <p className="text-sm text-indigo-300 font-mono mb-6 max-w-xs text-center truncate">
        {displayUrl}
      </p>
      <p
        key={msgIndex}
        className="text-sm text-zinc-400 transition-all duration-500 text-center"
        style={{ animation: "fadeSlide 0.5s ease" }}
      >
        {messages[msgIndex]}
      </p>
      <p className="mt-8 text-xs text-zinc-600 text-center max-w-xs">
        This typically takes 30-60 seconds. Please keep this tab open.
      </p>
    </section>
  );
}
