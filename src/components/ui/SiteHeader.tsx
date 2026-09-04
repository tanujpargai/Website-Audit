import Link from "next/link";
import { SITE_CONFIG } from "@/lib/config";
import Logo from "@/components/ui/Logo";

export default function SiteHeader() {
  return (
    <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
          <Logo size="md" />
        </Link>
        <a
          href={SITE_CONFIG.CONTACT_URL}
          className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/5 px-4 py-1.5 text-xs font-medium text-purple-300 transition-all hover:bg-purple-500/15 hover:border-purple-400 hover:text-white"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>{SITE_CONFIG.companyName}</span>
        </a>
      </div>
    </header>
  );
}
