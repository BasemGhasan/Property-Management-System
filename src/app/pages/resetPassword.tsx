// ============================================================================
// ResetPasswordPage — set a new password from a reset link.
// ============================================================================

// Imports
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { KeyRound } from "lucide-react";
import { AuthLayout } from "../layouts/authLayout";
import { PageHeader } from "../components/auth/pageHeader";
import { PasswordField } from "../components/auth/passwordField";
import { PrimaryButton } from "../components/auth/buttons";
import { AuthSuccessScreen } from "../components/auth/authSuccessScreen";
import { resetPassword } from "../services/authService";
import { isRequired, hasMinLength } from "../services/validators";
import { ROUTES } from "../constants/auth";

// Interfaces
interface ResetErrors {
  password?: string;
  confirmPassword?: string;
}

// Component
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ResetErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation
  const validate = useCallback((): ResetErrors => {
    const next: ResetErrors = {};
    if (!isRequired(password)) next.password = "Password is required.";
    else if (!hasMinLength(password, 8)) next.password = "Use at least 8 characters.";
    if (confirmPassword !== password)
      next.confirmPassword = "Passwords do not match.";
    return next;
  }, [password, confirmPassword]);

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validation = validate();
      setErrors(validation);
      if (Object.keys(validation).length > 0) return;

      setLoading(true);
      await resetPassword(password);
      setLoading(false);
      setSuccess(true);
    },
    [password, validate]
  );

  // Success state
  if (success) {
    return (
      <AuthLayout>
        <AuthSuccessScreen
          title="Password updated"
          message="Password successfully updated. You can now sign in with your new password."
          actionLabel="Return to login"
          onAction={() => navigate(ROUTES.login)}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <PageHeader
        title="Reset your password"
        subtitle="Choose a new, strong password for your account"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <PasswordField
          label="New Password"
          name="password"
          placeholder="Enter new password"
          showStrength
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Re-enter new password"
          value={confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <PrimaryButton type="submit" loading={loading}>
          {!loading && <KeyRound size={18} />}
          Reset Password
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
