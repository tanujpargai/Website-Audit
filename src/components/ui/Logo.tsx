interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTag?: boolean;
}

export default function Logo({ size = "md", showTag = true }: LogoProps) {
  const badgeSize =
    size === "sm" ? "h-7 w-7 text-lg" : size === "lg" ? "h-11 w-11 text-3xl" : "h-9 w-9 text-2xl";

  return (
    <div className="flex items-center gap-3 group">
      {/* Integral Mathematical Symbol Icon Mark */}
      <div
        className={`relative flex ${badgeSize} items-center justify-center rounded-xl bg-gradient-to-b from-zinc-900 to-black border border-purple-500/30 shadow-md shadow-purple-500/15 transition-all duration-300 group-hover:border-purple-400/60 group-hover:shadow-purple-500/30`}
      >
        <span
          className="font-serif italic font-bold leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-300 to-purple-500 select-none translate-y-[-1px]"
          aria-hidden="true"
        >
          ∫
        </span>
        <span
          className="absolute -top-0.5 -right-0.5 flex h-2 w-2"
          aria-hidden="true"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
        </span>
      </div>

      {/* Brand Typography */}
      <div className="flex items-center gap-2">
        <span className="text-[14px] font-bold tracking-[0.16em] text-white">
          INTEGRAL
        </span>
        {showTag && (
          <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-purple-300 uppercase">
            Audit
          </span>
        )}
      </div>
    </div>
  );
}
