import { Progress } from "@/components/ui/progress";

export function PromptQualityScore() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Prompt Quality Score</p>
          <p className="mt-1 text-3xl font-semibold">
            78<span className="text-lg text-muted-foreground">/100</span>
          </p>
        </div>
        <span className="rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning">
          Moderate Clarity
        </span>
      </div>
      <Progress value={78} className="mt-4 h-2" />
      <p className="mt-3 text-sm text-muted-foreground">
        The prompt is useful but lacks specific business context.
      </p>
    </section>
  );
}
