// ============================================================================
// RoleCard — large clickable card used on the Role Selection page.
// ============================================================================

// Imports
import { Check } from "lucide-react";
import type { RoleDefinition } from "../../constants/auth";

// Interfaces
interface RoleCardProps {
  role: RoleDefinition;
  selected: boolean;
  onSelect: (id: RoleDefinition["id"]) => void;
}

// Component
export function RoleCard({ role, selected, onSelect }: RoleCardProps) {
  const Icon = role.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(role.id)}
      aria-pressed={selected}
      className={[
        "group relative flex w-full flex-col items-start gap-4 rounded-2xl border p-6 text-left",
        "transition-all duration-200",
        selected
          ? "border-primary bg-primary/10 ring-2 ring-primary/40"
          : "border-border bg-card/60 hover:bg-card",
      ].join(" ")}
    >
      {/* Selected check badge */}
      {selected && (
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check size={14} />
        </span>
      )}

      {/* Icon */}
      <span
        className={[
          "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-primary group-hover:bg-secondary/80",
        ].join(" ")}
      >
        <Icon size={24} />
      </span>

      {/* Text */}
      <div>
        <h3 className="text-foreground">{role.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
      </div>
    </button>
  );
}
