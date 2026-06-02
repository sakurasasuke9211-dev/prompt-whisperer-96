import { PanelLeft } from "lucide-react";

export function AppHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center gap-3 border-b border-border px-6 py-4">
      <PanelLeft className="size-5 text-muted-foreground" />
      <h1 className="text-base font-medium">{title}</h1>
    </header>
  );
}
