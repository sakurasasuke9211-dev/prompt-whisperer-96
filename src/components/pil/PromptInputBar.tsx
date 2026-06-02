import { Paperclip, Mic, ArrowUp } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function PromptInputBar({ value, onChange, onSubmit, disabled }: Props) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Message ChatGPT"
        rows={3}
        className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit();
        }}
      />
      <div className="mt-2 flex items-center justify-between">
        <button className="text-muted-foreground transition-colors hover:text-foreground">
          <Paperclip className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <button className="text-muted-foreground transition-colors hover:text-foreground">
            <Mic className="size-5" />
          </button>
          <button
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <ArrowUp className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
