import { Badge } from "@/components/ui/Badge";
import type { ResponsePriority } from "@/types/signalvault";

const TONE: Record<ResponsePriority, "danger" | "warn" | "accent" | "muted" | "neutral"> = {
  p0: "danger",
  p1: "warn",
  p2: "accent",
  p3: "muted",
  unranked: "neutral",
};

const LABEL: Record<ResponsePriority, string> = {
  p0: "P0",
  p1: "P1",
  p2: "P2",
  p3: "P3",
  unranked: "—",
};

export function PriorityBadge({ value }: { value: ResponsePriority }) {
  return <Badge tone={TONE[value]}>{LABEL[value]}</Badge>;
}
