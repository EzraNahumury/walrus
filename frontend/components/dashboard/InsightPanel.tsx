import { Lightbulb, Sparkles } from "lucide-react";

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import type { FeedbackInsight } from "@/types/signalvault";

export function InsightPanel({ insight }: { insight: FeedbackInsight }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[color:var(--color-accent)]" />
          <h3 className="text-sm font-semibold text-[color:var(--color-ink-900)]">Insights</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Responses" value={insight.totalResponses} />
          <Stat
            label="Avg rating"
            value={
              insight.averageRating !== undefined
                ? insight.averageRating.toFixed(1)
                : "—"
            }
          />
          <Stat label="P0 / P1" value={insight.highPriorityCount} />
          <Stat label="Top tag" value={insight.topTags[0]?.tag ?? "—"} />
        </div>

        {insight.ratingHistogram &&
          Object.keys(insight.ratingHistogram).length > 0 && (
            <Histogram data={insight.ratingHistogram} />
          )}

        {insight.recurringPhrases.length > 0 && (
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-ink-500)] mb-2">
              Recurring phrases
            </div>
            <div className="flex flex-wrap gap-2">
              {insight.recurringPhrases.map((p) => (
                <span
                  key={p.phrase}
                  className="rounded-full border border-[color:var(--color-line)] bg-white px-2.5 py-1 text-xs text-[color:var(--color-ink-700)]"
                >
                  {p.phrase}
                  <span className="ml-1 text-[color:var(--color-ink-400)]">×{p.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/5 px-4 py-3">
          <Lightbulb className="h-4 w-4 text-[color:var(--color-accent)] mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-accent)] mb-1">
              Suggested next action
            </div>
            <div className="text-sm text-[color:var(--color-ink-900)]">
              {insight.suggestedNextAction}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-ink-500)]">
        {label}
      </div>
      <div className="text-2xl font-serif italic text-[color:var(--color-ink-900)] mt-1">{value}</div>
    </div>
  );
}

function Histogram({ data }: { data: Record<number, number> }) {
  const entries = Object.entries(data)
    .map(([k, v]) => [Number(k), v] as const)
    .sort((a, b) => b[0] - a[0]);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div>
      <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-ink-500)] mb-2">
        Rating distribution
      </div>
      <div className="space-y-1.5">
        {entries.map(([star, count]) => (
          <div key={star} className="flex items-center gap-3 text-xs">
            <span className="w-6 text-[color:var(--color-ink-700)]">{star}★</span>
            <div className="flex-1 h-2 rounded-full bg-[color:var(--color-bg-soft)] border border-[color:var(--color-line)] overflow-hidden">
              <div
                className="h-full bg-[color:var(--color-ink-900)]"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-[color:var(--color-ink-500)]">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
