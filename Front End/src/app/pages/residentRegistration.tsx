// ============================================================================
// ResidentRegistrationPage — sign-up form for residents.
// ============================================================================

// Imports
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Building, UserPlus } from "lucide-react";
import { AuthLayout } from "../layouts/authLayout";
import { PageHeader } from "../components/auth/pageHeader";
import { InputField } from "../components/auth/inputField";
import { CommonRegistrationFields } from "../components/auth/commonRegistrationFields";
import { CheckboxField } from "../components/auth/checkboxField";
import { PrimaryButton } from "../components/auth/buttons";
import { AuthSuccessScreen } from "../components/auth/authSuccessScreen";
import { useRegistrationForm } from "../hooks/useRegistrationForm";
import { register } from "../services/authService";
import { ROUTES } from "../constants/auth";

// Component
export default function ResidentRegistrationPage() {
  const navigate = useNavigate();
  const {
    fields,
    setField,
    errors,
    setErrors,
    acceptedTerms,
    setAcceptedTerms,
    validateCommon,
  } = useRegistrationForm();

  // Role-specific (optional) field
  const [propertyName, setPropertyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validation = validateCommon();
      setErrors(validation);
      if (!acceptedTerms) toast.error("You must accept the terms.");

      if (Object.keys(validation).length > 0 || !acceptedTerms) return;

      setLoading(true);
      const result = await register({
        role: "resident",
        fullName: fields.fullName,
        email: fields.email,
        phone: fields.phone,
        password: fields.password,
        extra: { propertyName },
      });
      setLoading(false);
      if (result.success) {
        setSuccess(true);
      } else {
        toast.error(result.message ?? "Registration failed. Please try again.");
      }
    },
    [fields, propertyName, acceptedTerms, validateCommon, setErrors]
  );

  // Success state
  if (success) {
    return (
      <AuthLayout>
        <AuthSuccessScreen
          title="Account created!"
          message="Your resident account is ready. Sign in to start submitting maintenance requests."
          actionLabel="Continue to login"
          onAction={() => navigate(ROUTES.login)}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout wide>
      <PageHeader
        title="Create resident account"
        subtitle="Submit maintenance requests and track issues"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <CommonRegistrationFields fields={fields} errors={errors} setField={setField} />

        <InputField
          label="Condo / Property Name (optional)"
          name="propertyName"
          placeholder="e.g. Maple Court Residences"
          icon={<Building size={18} />}
          value={propertyName}
          onChange={(e) => setPropertyName(e.target.value)}
        />

        <CheckboxField id="terms" checked={acceptedTerms} onChange={setAcceptedTerms}>
          I agree to the{" "}
          <span className="text-primary">Terms &amp; Conditions</span> and{" "}
          <span className="text-primary">Privacy Policy</span>.
        </CheckboxField>

        <PrimaryButton type="submit" loading={loading} disabled={!acceptedTerms}>
          {!loading && <UserPlus size={18} />}
          Create Account
        </PrimaryButton>

        <button
          type="button"
          onClick={() => navigate(ROUTES.roleSelection)}
          className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to account type
        </button>
      </form>
    </AuthLayout>
  );
}
