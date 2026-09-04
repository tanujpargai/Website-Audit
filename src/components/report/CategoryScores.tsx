import { AuditScores, AiAssessments } from "@/lib/audit/types";
import { getScoreLabel } from "./ScoreRing";

interface CategoryScoresProps {
  scores: AuditScores;
  assessments: AiAssessments;
}

const categoryMeta: {
  key: keyof AuditScores;
  label: string;
  assessmentKey: keyof AiAssessments;
  weight: string;
}[] = [
  { key: "design", label: "Design", assessmentKey: "design", weight: "15%" },
  { key: "ux", label: "UX", assessmentKey: "ux", weight: "20%" },
  { key: "seo", label: "SEO", assessmentKey: "seo", weight: "20%" },
  { key: "content", label: "Content", assessmentKey: "content", weight: "15%" },
  { key: "conversion", label: "Conversion", assessmentKey: "conversion", weight: "15%" },
  {
    key: "performanceSignals",
    label: "Performance Signals",
    assessmentKey: "performanceSignals",
    weight: "5%",
  },
  { key: "technical", label: "Technical", assessmentKey: "technical", weight: "10%" },
];

function ScoreBar({ score }: { score: number }) {
  const { color } = getScoreLabel(score);
  const barColor =
    score >= 80 ? "bg-emerald-500" :
    score >= 65 ? "bg-lime-500" :
    score >= 50 ? "bg-amber-400" :
    score >= 35 ? "bg-orange-500" :
    "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
        <div
          className={`h-1.5 rounded-full ${barColor} transition-all duration-700`}
          style={{ width: `${score}%` }}
          aria-hidden="true"
        />
      </div>
      <span className={`text-sm font-semibold tabular-nums w-8 text-right ${color}`}>
        {score}
      </span>
    </div>
  );
}

export default function CategoryScores({ scores, assessments }: CategoryScoresProps) {
  return (
    <section aria-labelledby="category-scores-heading">
      <h2
        id="category-scores-heading"
        className="text-lg font-semibold text-white mb-5"
      >
        Category Scores
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categoryMeta.map(({ key, label, assessmentKey, weight }) => {
          const score = scores[key];
          const assessment = assessments[assessmentKey];
          const { label: statusLabel, color } = getScoreLabel(score);
          return (
            <div
              key={key}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">{label}</h3>
                  <p className="text-xs text-zinc-600">{weight} weight</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                    score >= 80 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" :
                    score >= 65 ? "border-lime-500/30 bg-lime-500/10 text-lime-400" :
                    score >= 50 ? "border-amber-400/30 bg-amber-400/10 text-amber-400" :
                    score >= 35 ? "border-orange-500/30 bg-orange-500/10 text-orange-400" :
                    "border-red-500/30 bg-red-500/10 text-red-400"
                  } ${color}`}
                >
                  {statusLabel}
                </span>
              </div>
              <ScoreBar score={score} />
              {assessment?.summary && (
                <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
                  {assessment.summary}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
