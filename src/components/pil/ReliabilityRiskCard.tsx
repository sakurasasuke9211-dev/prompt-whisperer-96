import { ShieldAlert } from "lucide-react";

export function ReliabilityRiskCard() {
  return (
    <section className="rounded-2xl border border-warning/30 bg-warning/5 p-5">
      <div className="flex items-center gap-3">
        <ShieldAlert className="size-5 text-warning" />
        <h3 className="font-medium">Reliability Risk Indicator</h3>
        <span className="ml-auto rounded-full bg-warning/20 px-3 py-1 text-sm font-medium text-warning">
          Risk: Medium
        </span>
      </div>
      <p className="mt-3 text-sm text-foreground">
        Prompt lacks industry, geography, audience, and output format.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Adding context may reduce the need for manual verification later.
      </p>
    </section>
  );
}
