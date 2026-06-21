// ============================================================================
// RoleSelectionPage — choose account type before registration.
// Shows Resident and Property Owner only (contractor role removed).
// ============================================================================

// Imports
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { AuthLayout } from "../layouts/authLayout";
import { PageHeader } from "../components/auth/pageHeader";
import { RoleCard } from "../components/auth/roleCard";
import { PrimaryButton } from "../components/auth/buttons";
import { ROLE_DEFINITIONS, ROUTES, type UserRole } from "../constants/auth";

// Component
export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<UserRole | null>(null);

  // Map each role to its registration route.
  const continueToRegistration = useCallback(() => {
    if (!selected) return;
    const routeByRole: Record<UserRole, string> = {
      resident: ROUTES.registerResident,
      owner: ROUTES.registerOwner,
    };
    navigate(routeByRole[selected]);
  }, [selected, navigate]);

  return (
    <AuthLayout>
      <PageHeader
        title="Choose your account type"
        subtitle="Select how you'll be using PropCare to get started"
      />

      {/* Two-column grid for two roles */}
      <div className="grid gap-4 sm:grid-cols-2">
        {ROLE_DEFINITIONS.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            selected={selected === role.id}
            onSelect={setSelected}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
        <PrimaryButton
          type="button"
          fullWidth={false}
          disabled={!selected}
          onClick={continueToRegistration}
          className="sm:flex-1"
        >
          Continue
          <ArrowRight size={18} />
        </PrimaryButton>

        <button
          type="button"
          onClick={() => navigate(ROUTES.login)}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          <ArrowLeft size={16} />
          Back to login
        </button>
      </div>
    </AuthLayout>
  );
}
