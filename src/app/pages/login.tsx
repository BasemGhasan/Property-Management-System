// ============================================================================
// LoginPage — sign-in screen for all user roles.
// ============================================================================

// Imports
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Mail, LogIn } from "lucide-react";
import { AuthLayout } from "../layouts/authLayout";
import { PageHeader } from "../components/auth/pageHeader";
import { InputField } from "../components/auth/inputField";
import { PasswordField } from "../components/auth/passwordField";
import { CheckboxField } from "../components/auth/checkboxField";
import { PrimaryButton, SecondaryButton } from "../components/auth/buttons";
import { ErrorMessage } from "../components/auth/messages";
import { ROUTES } from "../constants/auth";
import { login } from "../services/authService";
import { dashboardRouteForRole } from "../lib/auth";
import { isValidEmail, isRequired } from "../services/validators";

// Interfaces
interface LoginErrors {
  email?: string;
  password?: string;
}

// Component
export default function LoginPage() {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Derived: form is fillable
  const canSubmit = useMemo(
    () => isRequired(email) && isRequired(password),
    [email, password]
  );

  // Validate the fields, returning the error map.
  const validate = useCallback((): LoginErrors => {
    const next: LoginErrors = {};
    if (!isRequired(email)) next.email = "Email is required.";
    else if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (!isRequired(password)) next.password = "Password is required.";
    return next;
  }, [email, password]);

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError("");

      const validation = validate();
      setErrors(validation);
      if (Object.keys(validation).length > 0) return;

      setLoading(true);
      const result = await login({ email, password, rememberMe });
      setLoading(false);

      if (result.success && result.role) {
        setFormError("");
        navigate(dashboardRouteForRole(result.role));
      } else {
        setFormError(result.message);
      }
    },
    [email, password, rememberMe, validate, navigate]
  );

  // Styles handled via Tailwind utility classes inline.
  return (
    <AuthLayout>
      <PageHeader title="Welcome back" subtitle="Sign in to your PropCare account" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {formError && <ErrorMessage>{formError}</ErrorMessage>}

        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={<Mail size={18} />}
          value={email}
          error={errors.email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordField
          label="Password"
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <CheckboxField id="rememberMe" checked={rememberMe} onChange={setRememberMe}>
            Remember me
          </CheckboxField>

          <button
            type="button"
            onClick={() => navigate(ROUTES.forgotPassword)}
            className="text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            Forgot password?
          </button>
        </div>

        <PrimaryButton type="submit" loading={loading} disabled={!canSubmit}>
          {!loading && <LogIn size={18} />}
          Sign in
        </PrimaryButton>

        <div className="relative my-1 flex items-center gap-3 text-xs text-slate-500">
          <span className="h-px flex-1 bg-slate-700" />
          New to PropCare?
          <span className="h-px flex-1 bg-slate-700" />
        </div>

        <SecondaryButton type="button" onClick={() => navigate(ROUTES.roleSelection)}>
          Create an account
        </SecondaryButton>
      </form>
    </AuthLayout>
  );
}
