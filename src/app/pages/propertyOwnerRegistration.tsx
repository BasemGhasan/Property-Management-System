// ============================================================================
// PropertyOwnerRegistrationPage — sign-up form for property owners with a
// dynamic list of property names.
// ============================================================================

// Imports
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, UserPlus, Plus, Trash2, Building2 } from "lucide-react";
import { AuthLayout } from "../layouts/authLayout";
import { PageHeader } from "../components/auth/pageHeader";
import { InputField } from "../components/auth/inputField";
import { CommonRegistrationFields } from "../components/auth/commonRegistrationFields";
import { CheckboxField } from "../components/auth/checkboxField";
import { PrimaryButton, SecondaryButton } from "../components/auth/buttons";
import { ErrorMessage, ValidationMessage } from "../components/auth/messages";
import { AuthSuccessScreen } from "../components/auth/authSuccessScreen";
import { useRegistrationForm } from "../hooks/useRegistrationForm";
import { register } from "../services/authService";
import { ROUTES } from "../constants/auth";
import { isRequired } from "../services/validators";

// Component
export default function PropertyOwnerRegistrationPage() {
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

  // Dynamic property list — starts with a single empty entry.
  const [propertyNames, setPropertyNames] = useState<string[]>([""]);
  const [propertyError, setPropertyError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Derived count of properties owned.
  const propertyCount = useMemo(
    () => propertyNames.filter((p) => isRequired(p)).length,
    [propertyNames]
  );

  // Property list handlers
  const updateProperty = useCallback((index: number, value: string) => {
    setPropertyNames((prev) => prev.map((p, i) => (i === index ? value : p)));
  }, []);

  const addProperty = useCallback(() => {
    setPropertyNames((prev) => [...prev, ""]);
  }, []);

  const removeProperty = useCallback((index: number) => {
    setPropertyNames((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validation = validateCommon();
      setErrors(validation);

      const hasProperty = propertyNames.some((p) => isRequired(p));
      setPropertyError(hasProperty ? "" : "Add at least one property.");
      setTermsError(acceptedTerms ? "" : "You must accept the terms.");

      if (Object.keys(validation).length > 0 || !hasProperty || !acceptedTerms)
        return;

      setLoading(true);
      setSubmitError("");
      const result = await register({
        role: "owner",
        fullName: fields.fullName,
        email: fields.email,
        phone: fields.phone,
        password: fields.password,
        extra: { properties: propertyNames.filter((p) => isRequired(p)) },
      });
      setLoading(false);
      if (result.success) {
        setSuccess(true);
      } else {
        setSubmitError(result.message ?? "Registration failed. Please try again.");
      }
    },
    [fields, propertyNames, acceptedTerms, validateCommon, setErrors]
  );

  // Success state
  if (success) {
    return (
      <AuthLayout>
        <AuthSuccessScreen
          title="Account created!"
          message="Your property owner account is ready. Sign in to manage your properties."
          actionLabel="Continue to login"
          onAction={() => navigate(ROUTES.login)}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout wide>
      <PageHeader
        title="Create owner account"
        subtitle="Manage properties, residents, and maintenance requests"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {submitError && <ErrorMessage>{submitError}</ErrorMessage>}

        <CommonRegistrationFields fields={fields} errors={errors} setField={setField} />

        {/* Property information section */}
        <div className="rounded-2xl border border-border bg-background/40 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground">
              <Building2 size={18} className="text-primary" />
              Property Information
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
              {propertyCount} owned
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {propertyNames.map((name, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <InputField
                    label={`Property ${index + 1}`}
                    name={`property-${index}`}
                    placeholder="e.g. Riverside Apartments"
                    value={name}
                    onChange={(e) => updateProperty(index, e.target.value)}
                  />
                </div>
                {propertyNames.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProperty(index)}
                    aria-label="Remove property"
                    className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-red-500/50 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <ValidationMessage message={propertyError} />

          <SecondaryButton
            type="button"
            fullWidth={false}
            onClick={addProperty}
            className="mt-3"
          >
            <Plus size={18} />
            Add another property
          </SecondaryButton>
        </div>

        <div className="flex flex-col gap-1.5">
          <CheckboxField id="terms" checked={acceptedTerms} onChange={setAcceptedTerms}>
            I agree to the{" "}
            <span className="text-primary">Terms &amp; Conditions</span> and{" "}
            <span className="text-primary">Privacy Policy</span>.
          </CheckboxField>
          {termsError && <ErrorMessage>{termsError}</ErrorMessage>}
        </div>

        <PrimaryButton type="submit" loading={loading}>
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
