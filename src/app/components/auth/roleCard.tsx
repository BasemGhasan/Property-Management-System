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
          ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/40"
          : "border-slate-700 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800",
      ].join(" ")}
    >
      {/* Selected check badge */}
      {selected && (
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
          <Check size={14} />
        </span>
      )}

      {/* Icon */}
      <span
        className={[
          "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
          selected
            ? "bg-blue-600 text-white"
            : "bg-slate-700/70 text-blue-400 group-hover:bg-slate-700",
        ].join(" ")}
      >
        <Icon size={24} />
      </span>

      {/* Text */}
      <div>
        <h3 className="text-slate-100">{role.title}</h3>
        <p className="mt-1 text-sm text-slate-400">{role.description}</p>
      </div>
    </button>
  );
}
