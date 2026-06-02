import { Check } from "lucide-react";
import { CONTEXT_FIELDS } from "@/lib/pil-data";

interface Props {
  selected: string[];
  values: Record<string, string>;
  onToggle: (key: string) => void;
  onChange: (key: string, value: string) => void;
}

export function MissingContextSelector({ selected, values, onToggle, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-medium">Missing Context Options</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Select what to add. Selected items reveal an input below.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {CONTEXT_FIELDS.map((f) => {
          const active = selected.includes(f.key);
          return (
            <button
              key={f.key}
              onClick={() => onToggle(f.key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary text-foreground hover:bg-accent"
              }`}
            >
              {active && <Check className="size-3.5" />}
              {f.label}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CONTEXT_FIELDS.filter((f) => selected.includes(f.key)).map((f) => (
            <div key={f.key}>
              <label className="text-xs text-muted-foreground">{f.label}</label>
              <input
                value={values[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
