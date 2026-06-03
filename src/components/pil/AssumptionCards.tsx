import { useState } from "react";
import { Check, Pencil } from "lucide-react";
import { ASSUMPTIONS, type Assumption } from "@/lib/pil-data";
import { Button } from "@/components/ui/button";

interface Props {
  assumptions?: Assumption[];
  accepted: Record<string, boolean>;
  values: Record<string, string>;
  onAccept: (id: string) => void;
  onChange: (id: string, value: string) => void;
}

export function AssumptionCards({ assumptions, accepted, values, onAccept, onChange }: Props) {
  const items = assumptions && assumptions.length > 0 ? assumptions : ASSUMPTIONS;
  const [editing, setEditing] = useState<Record<string, boolean>>({});

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-medium">Assumptions AI May Make</h3>
      <div className="mt-4 space-y-3">
        {items.map((a) => (
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
                  <Button size="sm" onClick={() => onAccept(a.id)}>
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
                onChange={(e) => onChange(a.id, e.target.value)}
                className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
