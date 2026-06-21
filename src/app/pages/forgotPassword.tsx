// ============================================================================
// ForgotPasswordPage — request a password reset link by email.
// ============================================================================

// Imports
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { AuthLayout } from "../layouts/authLayout";
import { PageHeader } from "../components/auth/pageHeader";
import { InputField } from "../components/auth/inputField";
import { PrimaryButton } from "../components/auth/buttons";
import { SuccessMessage } from "../components/auth/messages";
import { sendResetLink } from "../services/authService";
import { isValidEmail, isRequired } from "../services/validators";
import { ROUTES } from "../constants/auth";

// Component
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isRequired(email)) return setError("Email is required.");
      if (!isValidEmail(email)) return setError("Enter a valid email address.");
      setError("");

      setLoading(true);
      await sendResetLink(email);
      setLoading(false);
      setSent(true);
    },
    [email]
  );

  return (
    <AuthLayout>
      <PageHeader
        title="Forgot password?"
        subtitle="Enter your email and we'll send you a reset link"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {sent && (
          <SuccessMessage>Password reset link sent successfully.</SuccessMessage>
        )}

        <InputField
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          value={email}
          error={error}
          disabled={sent}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Demo helper: jump to reset page after the link is "sent". */}
        {sent ? (
          <PrimaryButton type="button" onClick={() => navigate(ROUTES.resetPassword)}>
            Open reset page
          </PrimaryButton>
        ) : (
          <PrimaryButton type="submit" loading={loading}>
            {!loading && <Send size={18} />}
            Send Reset Link
          </PrimaryButton>
        )}

        <button
          type="button"
          onClick={() => navigate(ROUTES.login)}
          className="inline-flex items-center justify-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          <ArrowLeft size={16} />
          Back to login
        </button>
      </form>
    </AuthLayout>
  );
}
