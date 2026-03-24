import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  skill: string;
  variant: "matched" | "missing";
}

export default function SkillBadge({ skill, variant }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium font-display",
        variant === "matched"
          ? "bg-primary/15 text-primary border border-primary/30"
          : "bg-destructive/15 text-destructive border border-destructive/30"
      )}
    >
      {variant === "matched" ? "✓" : "✗"} {skill}
    </span>
  );
}
