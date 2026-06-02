import { Zap } from "lucide-react";
import { PREVIEW_CONTEXT, PREVIEW_ASSUMPTIONS } from "@/lib/pil-data";

export function PromptIntelligencePreview() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center gap-2">
        <Zap className="size-4 text-warning" />
        <span className="font-medium text-foreground">Prompt Intelligence</span>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">Suggested Context to Improve Accuracy</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {PREVIEW_CONTEXT.map((c) => (
          <span key={c} className="rounded-full border border-border bg-secondary px-3 py-1.5 text-sm">
            {c}
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">Potential Assumptions AI May Make</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {PREVIEW_ASSUMPTIONS.map((a) => (
          <span
            key={a}
            className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1.5 text-sm text-warning"
          >
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}
