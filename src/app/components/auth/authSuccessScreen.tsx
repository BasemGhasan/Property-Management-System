// ============================================================================
// AuthSuccessScreen — full success state shown after registration / reset.
// ============================================================================

// Imports
import { CheckCircle2 } from "lucide-react";
import { PrimaryButton } from "./buttons";

// Interfaces
interface AuthSuccessScreenProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

// Component
export function AuthSuccessScreen({
  title,
  message,
  actionLabel,
  onAction,
}: AuthSuccessScreenProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
        <CheckCircle2 size={34} />
      </span>

      <h1 className="text-foreground">{title}</h1>
      <p className="mt-2 mb-7 text-sm text-muted-foreground">{message}</p>

      <PrimaryButton type="button" onClick={onAction}>
        {actionLabel}
      </PrimaryButton>
    </div>
  );
}
