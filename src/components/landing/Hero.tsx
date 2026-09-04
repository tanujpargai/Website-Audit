"use client";

import { useState, useRef, FormEvent } from "react";
import { AuditResponseSuccess, AuditResponse } from "@/lib/audit/types";

interface HeroProps {
  onAuditComplete: (result: AuditResponseSuccess) => void;
  onAuditStart: (url: string) => void;
  isScanning: boolean;
}

export default function Hero({ onAuditComplete, onAuditStart, isScanning }: HeroProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [localScanning, setLocalScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const scanning = isScanning || localScanning;

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case "INVALID_URL":
        return "Please enter a valid public website URL (e.g. example.com).";
      case "FETCH_FAILED":
        return "We couldn't access that website. It may be unavailable, blocking automated requests, or taking too long to respond.";
      case "ANALYSIS_FAILED":
        return "We couldn't complete the analysis right now. Please try again in a moment.";
      case "RATE_LIMITED":
        return "The audit service is temporarily busy. Please try again shortly.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a website URL to analyze.");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setLocalScanning(true);
    onAuditStart(trimmed);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      let data: AuditResponse;
      try {
        data = (await res.json()) as AuditResponse;
      } catch {
        setLocalScanning(false);
        setError("Received an unexpected response from the server. Please try again.");
        return;
      }
      if (!data.success) {
        setLocalScanning(false);
        setError(getErrorMessage(data.error));
        return;
      }
      setLocalScanning(false);
      onAuditComplete(data);
    } catch {
      setLocalScanning(false);
      setError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-20 sm:px-6 lg:pt-28 lg:pb-28">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.12), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-3xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-400 mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          AI analysis across 7 website dimensions
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Know what&apos;s holding{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
            your website back.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base text-zinc-400 sm:text-lg leading-relaxed">
          Enter any public website URL and receive a plain-English audit across
          design, UX, SEO, content, conversion, performance signals, and
          technical quality — no jargon, no account required.
        </p>

        {/* URL Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 mx-auto max-w-2xl"
          noValidate
        >
          <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-2 shadow-2xl shadow-black/50 focus-within:border-indigo-500/60 transition-colors">
            <label htmlFor="website-url" className="sr-only">
              Website URL
            </label>
            <input
              ref={inputRef}
              id="website-url"
              type="url"
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              disabled={scanning}
              placeholder="example.com or https://example.com"
              className="flex-1 rounded-xl bg-transparent px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none disabled:opacity-50 min-w-0"
              aria-describedby={error ? "url-error" : undefined}
              aria-invalid={error ? "true" : undefined}
            />
            <button
              type="submit"
              disabled={scanning}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {scanning ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
                  Analyzing&hellip;
                </>
              ) : (
                "Run Free Audit"
              )}
            </button>
          </div>

          {error && (
            <p
              id="url-error"
              role="alert"
              className="mt-3 text-sm text-red-400 text-center"
            >
              {error}
            </p>
          )}

          <p className="mt-3 text-xs text-zinc-600 text-center">
            Homepage analysis &bull; No account required &bull; Takes about a minute
          </p>
        </form>
      </div>
    </section>
  );
}
