import { SITE_CONFIG } from "@/lib/config";
import Logo from "@/components/ui/Logo";

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-900 py-10 mt-auto bg-zinc-950/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-zinc-600 sm:flex-row">
          <div className="flex items-center gap-3">
            <Logo size="sm" showTag={false} />
            <span className="text-zinc-500">
              &copy; {new Date().getFullYear()} {SITE_CONFIG.companyName}. All rights reserved.
            </span>
          </div>
          <p className="text-center sm:text-right text-zinc-500">
            Intelligent Website Audit &bull; Powered by Google Gemini
          </p>
        </div>
      </div>
    </footer>
  );
}
