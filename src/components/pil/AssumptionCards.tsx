import { useState } from "react";
import { Check, Pencil } from "lucide-react";
import { ASSUMPTIONS } from "@/lib/pil-data";
import { Button } from "@/components/ui/button";

export function AssumptionCards() {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-medium">Assumptions AI May Make</h3>
      <div className="mt-4 space-y-3">
        {ASSUMPTIONS.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-warning/30 bg-warning/5 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-foreground">{values[a.id] ?? a.text}</p>
              {accepted[a.id] ? (
                <span className="flex items-center gap-1 text-xs font-medium text-primary">
                  <Check className="size-3.5" /> Accepted
                </span>
              ) : (
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" onClick={() => setAccepted((p) => ({ ...p, [a.id]: true }))}>
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing((p) => ({ ...p, [a.id]: !p[a.id] }))}
                  >
                    <Pencil className="size-3.5" /> Change
                  </Button>
                </div>
              )}
            </div>
            {editing[a.id] && !accepted[a.id] && (
              <input
                autoFocus
                defaultValue={a.text}
                onChange={(e) => setValues((p) => ({ ...p, [a.id]: e.target.value }))}
                className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
