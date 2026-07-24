// ============================================================================
// OwnerProfilePage — manage owner account info, property summary, security.
// Uses shared FormSection instead of a locally-defined Section component.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Mail, Phone, Building2, Users, Save, KeyRound } from "lucide-react";
import { OwnerLayout } from "../../layouts/ownerLayout";
import { InputField } from "../../components/auth/inputField";
import { PasswordField } from "../../components/auth/passwordField";
import { CheckboxField } from "../../components/auth/checkboxField";
import { PrimaryButton } from "../../components/auth/buttons";
import { FormSection } from "../../components/shared/formSection";
import { getStoredUser } from "../../lib/auth";
import { api } from "../../lib/apiClient";
import { getProperties } from "../../services/ownerService";

// Component
export default function OwnerProfilePage() {
  const stored = getStoredUser();
  const [fullName, setFullName] = useState(stored?.fullName ?? "");
  const [email, setEmail]       = useState(stored?.email ?? "");
  const [phone, setPhone]       = useState(stored?.phone ?? "");
  const [propertyCount, setPropertyCount] = useState(0);
  const [residentCount, setResidentCount] = useState(0);

  const loadData = useCallback(() =>
    getProperties().then((props) => {
      setPropertyCount(props.length);
      setResidentCount(props.reduce((s, p) => s + p.residents.length, 0));
    }), []);

  const [emailNotif, setEmailNotif] = useState(true);

  useEffect(() => {
    let active = true;
    loadData();
    api.get<{ emailNotificationsEnabled: boolean }>("/api/users/me").then((me) => {
      if (active) setEmailNotif(me.emailNotificationsEnabled);
    });
    return () => { active = false; };
  }, [loadData]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError]       = useState("");

  const handleSaveProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await api.put("/api/users/me", { fullName, phone, email, emailNotificationsEnabled: emailNotif });
    toast.success("Profile updated successfully.");
  }, [fullName, phone, email, emailNotif]);

  const handleUpdatePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }
    setConfirmError("");
    try {
      await api.put("/api/users/me/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password.");
    }
  }, [currentPassword, newPassword, confirmPassword]);

  return (
    <OwnerLayout title="Profile" onRefresh={loadData}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
          <FormSection title="Personal Information" icon={User}>
            <div className="flex flex-col gap-5">
              <InputField label="Full Name" name="fullName" icon={<User size={18} />} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField label="Email" name="email" type="email" icon={<Mail size={18} />} value={email} onChange={(e) => setEmail(e.target.value)} />
                <InputField label="Phone" name="phone" type="tel" icon={<Phone size={18} />} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </FormSection>

          {/* Property summary is read-only — derived from the database in production */}
          <FormSection title="Property Summary" icon={Building2}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3">
                <Building2 size={18} className="text-primary" />
                <div>
                  <p className="text-lg text-foreground">{propertyCount}</p>
                  <p className="text-xs text-muted-foreground">Properties Owned</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3">
                <Users size={18} className="text-primary" />
                <div>
                  <p className="text-lg text-foreground">{residentCount}</p>
                  <p className="text-xs text-muted-foreground">Total Residents</p>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Notification Preferences" icon={Mail}>
            <div className="flex flex-col gap-4">
              <CheckboxField id="ownerEmailNotif" checked={emailNotif} onChange={setEmailNotif}>
                Email notifications for new and updated requests
              </CheckboxField>
            </div>
          </FormSection>

          <PrimaryButton type="submit" fullWidth={false} className="sm:self-start">
            <Save size={18} /> Save Changes
          </PrimaryButton>
        </form>

        <form onSubmit={handleUpdatePassword}>
          <FormSection title="Security" icon={KeyRound}>
            <div className="flex flex-col gap-5">
              <PasswordField label="Current Password" name="currentPassword" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <div className="grid gap-5 sm:grid-cols-2">
                <PasswordField label="New Password" name="newPassword" placeholder="Enter new password" showStrength value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <PasswordField
                  label="Confirm New Password"
                  name="confirmPassword"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  error={confirmError}
                  onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(""); }}
                />
              </div>
            </div>
            <PrimaryButton type="submit" fullWidth={false} className="mt-5 sm:self-start">
              <KeyRound size={18} /> Update Password
            </PrimaryButton>
          </FormSection>
        </form>
      </div>
    </OwnerLayout>
  );
}
