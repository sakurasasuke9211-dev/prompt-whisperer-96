import { IMPROVEMENT_METRICS } from "@/lib/pil-data";
import { ArrowRight } from "lucide-react";

export function ImprovementMetrics() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {IMPROVEMENT_METRICS.map((m) => (
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
