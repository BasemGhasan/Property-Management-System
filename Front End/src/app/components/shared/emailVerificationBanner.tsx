// ============================================================================
// EmailVerificationBanner — nudges unverified users to confirm their email.
// Shown across all portals via PortalLayout; opens a modal to enter the OTP.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { MailWarning, X } from "lucide-react";
import { PrimaryButton } from "../auth/buttons";
import { verifyEmail, resendVerificationEmail } from "../../services/authService";
import { getStoredUser, type StoredUser } from "../../lib/auth";

// Component
export function EmailVerificationBanner() {
  const [verified, setVerified] = useState(() => getStoredUser()?.emailVerified ?? true);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const handleUserUpdated = (e: Event) => {
      setVerified((e as CustomEvent<StoredUser>).detail.emailVerified);
    };
    window.addEventListener("auth:user-updated", handleUserUpdated);
    return () => window.removeEventListener("auth:user-updated", handleUserUpdated);
  }, []);

  const handleVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setVerifying(true);
    const result = await verifyEmail(code);
    setVerifying(false);
    if (result.success) {
      setVerified(true);
      setOpen(false);
      setCode("");
      toast.success("Email verified successfully.");
    } else {
      toast.error(result.message);
    }
  }, [code]);

  const handleResend = useCallback(async () => {
    setResending(true);
    const result = await resendVerificationEmail();
    setResending(false);
    toast[result.success ? "success" : "error"](result.message);
  }, []);

  if (verified) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm">
      <div className="flex items-center gap-2 text-warning">
        <MailWarning size={18} className="shrink-0" />
        <span>Please verify your email address to secure your account.</span>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button className="rounded-lg border border-warning/40 px-3 py-1.5 text-xs font-medium text-warning transition-colors hover:bg-warning/10">
            Verify now
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg focus:outline-none">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <Dialog.Title className="text-foreground">Verify your email</Dialog.Title>
              <Dialog.Close asChild>
                <button aria-label="Close" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleVerify} className="flex flex-col gap-4 px-6 py-5">
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code we emailed you. Didn't get it? Send a new one below.
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="rounded-xl border border-border bg-input px-4 py-2.5 text-center text-lg tracking-[0.5em] text-foreground focus:border-primary focus:outline-none"
              />

              <PrimaryButton type="submit" loading={verifying} disabled={code.length !== 6}>
                Verify
              </PrimaryButton>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-center text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
              >
                {resending ? "Sending…" : "Resend code"}
              </button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
