"use client";

import { useState, useRef, useEffect } from "react";
import { AuditResponseSuccess } from "@/lib/audit/types";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import Hero from "@/components/landing/Hero";
import WhatWeAnalyze from "@/components/landing/WhatWeAnalyze";
import WhyDifferent from "@/components/landing/WhyDifferent";
import IntegralLabsSection from "@/components/landing/IntegralLabsSection";
import ScanningState from "@/components/report/ScanningState";
import AuditReport from "@/components/report/AuditReport";

type PageState = "landing" | "scanning" | "report";

export default function HomePage() {
  const [pageState, setPageState] = useState<PageState>("landing");
  const [scanUrl, setScanUrl] = useState("");
  const [auditResult, setAuditResult] = useState<AuditResponseSuccess | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Scroll up when scanning starts
  useEffect(() => {
    if (pageState === "scanning") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pageState]);

  // Scroll to report when ready
  useEffect(() => {
    if (pageState === "report" && reportRef.current) {
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [pageState]);

  // Called when user clicks submit — receives the URL being submitted
  const handleAuditStart = (submittedUrl: string) => {
    setScanUrl(submittedUrl);
    setPageState("scanning");
  };

  const handleAuditComplete = (result: AuditResponseSuccess) => {
    setAuditResult(result);
    setPageState("report");
  };

  const handleReset = () => {
    setAuditResult(null);
    setScanUrl("");
    setPageState("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isScanning = pageState === "scanning";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      <SiteHeader />
      <main className="flex-1">
        {pageState === "landing" && (
          <>
            <Hero
              onAuditComplete={handleAuditComplete}
              onAuditStart={handleAuditStart}
              isScanning={isScanning}
            />
            <WhatWeAnalyze />
            <WhyDifferent />
            <IntegralLabsSection />
          </>
        )}
        {pageState === "scanning" && <ScanningState url={scanUrl} />}
        {pageState === "report" && auditResult && (
          <div ref={reportRef} className="pt-8">
            <AuditReport result={auditResult} onReset={handleReset} />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
