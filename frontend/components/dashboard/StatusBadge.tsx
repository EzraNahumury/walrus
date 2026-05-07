import { Badge } from "@/components/ui/Badge";
import type { ResponseStatus } from "@/types/signalvault";

const TONE: Record<ResponseStatus, "neutral" | "accent" | "warn" | "ok" | "muted"> = {
  new: "accent",
  reviewing: "warn",
  triaged: "neutral",
  shipped: "ok",
  wontfix: "muted",
};

const LABEL: Record<ResponseStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  triaged: "Triaged",
  shipped: "Shipped",
  wontfix: "Won't fix",
};

export function StatusBadge({ value }: { value: ResponseStatus }) {
  return <Badge tone={TONE[value]}>{LABEL[value]}</Badge>;
}
