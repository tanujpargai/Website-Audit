interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e"; // green
  if (score >= 65) return "#a3e635"; // lime
  if (score >= 50) return "#facc15"; // yellow
  if (score >= 35) return "#f97316"; // orange
  return "#ef4444"; // red
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "text-emerald-400" };
  if (score >= 65) return { label: "Good", color: "text-lime-400" };
  if (score >= 50) return { label: "Needs Attention", color: "text-amber-400" };
  if (score >= 35) return { label: "Poor", color: "text-orange-400" };
  return { label: "Critical", color: "text-red-400" };
}

export default function ScoreRing({
  score,
  size = 140,
  strokeWidth = 10,
}: ScoreRingProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;
  const color = getScoreColor(clampedScore);
  const { label, color: labelColor } = getScoreLabel(clampedScore);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`Overall score: ${clampedScore} out of 100`}
        role="img"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2 - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.22}
          fontWeight="700"
          fill="white"
          fontFamily="var(--font-geist-sans)"
        >
          {clampedScore}
        </text>
        <text
          x={size / 2}
          y={size / 2 + size * 0.18}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.1}
          fill="#71717a"
          fontFamily="var(--font-geist-sans)"
        >
          / 100
        </text>
      </svg>
      <span className={`text-sm font-medium ${labelColor}`}>{label}</span>
    </div>
  );
}
