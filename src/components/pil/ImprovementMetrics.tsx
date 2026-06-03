import { IMPROVEMENT_METRICS, type Metric } from "@/lib/pil-data";
import { ArrowRight } from "lucide-react";

interface Props {
  metrics?: Metric[];
}

export function ImprovementMetrics({ metrics }: Props) {
  const items = metrics && metrics.length > 0 ? metrics : IMPROVEMENT_METRICS;
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((m) => (
        <div key={m.label} className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{m.label}</p>
          <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
            {m.from && (
              <>
                <span className="text-muted-foreground">{m.from}</span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </>
            )}
            <span className="text-primary">{m.to}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
