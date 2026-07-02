// ============================================================================
// AdminProfilePage — personal info, security, and notification preferences.
// Uses shared FormSection for consistent styling with resident/owner profiles.
// ============================================================================

// Imports
import { useCallback, useState } from "react";
import { User, Mail, Phone, Save, KeyRound, Bell } from "lucide-react";
import { AdminLayout } from "../../layouts/adminLayout";
import { InputField } from "../../components/auth/inputField";
import { PasswordField } from "../../components/auth/passwordField";
import { CheckboxField } from "../../components/auth/checkboxField";
import { PrimaryButton } from "../../components/auth/buttons";
import { SuccessMessage } from "../../components/auth/messages";
import { FormSection } from "../../components/shared/formSection";
import { getStoredUser } from "../../lib/auth";
import { api } from "../../lib/apiClient";

// Component
export default function AdminProfilePage() {
  const stored = getStoredUser();
  const [fullName, setFullName] = useState(stored?.fullName ?? "");
  const [email, setEmail]       = useState(stored?.email ?? "");
  const [phone, setPhone]       = useState(stored?.phone ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");

  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif]     = useState(false);

  const [savedProfile,  setSavedProfile]  = useState(false);
  const [savedPassword, setSavedPassword] = useState(false);

  const handleSaveProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await api.put("/api/users/me", { fullName, phone });
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2500);
  }, [fullName, phone]);

  const handleUpdatePassword = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setSavedPassword(true);
    setCurrentPassword("");
    setNewPassword("");
    setTimeout(() => setSavedPassword(false), 2500);
  }, [currentPassword, newPassword]);

  return (
    <AdminLayout title="Profile">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
          {savedProfile && <SuccessMessage>Profile updated successfully.</SuccessMessage>}

          <FormSection title="Personal Information" icon={User} accentColor="text-violet-700">
            <div className="flex flex-col gap-5">
              <InputField label="Full Name" name="fullName" icon={<User size={18} />} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField label="Email" name="email" type="email" icon={<Mail size={18} />} value={email} onChange={(e) => setEmail(e.target.value)} />
                <InputField label="Phone" name="phone" type="tel" icon={<Phone size={18} />} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </FormSection>

          <FormSection title="Notification Preferences" icon={Bell} accentColor="text-violet-700">
            <div className="flex flex-col gap-4">
              <CheckboxField id="adminEmailNotif" checked={emailNotif} onChange={setEmailNotif}>
                Email alerts for new user registrations and critical requests
              </CheckboxField>
              <CheckboxField id="adminSmsNotif" checked={smsNotif} onChange={setSmsNotif}>
                SMS alerts for system-critical events
              </CheckboxField>
            </div>
          </FormSection>

          <PrimaryButton type="submit" fullWidth={false} className="sm:self-start">
            <Save size={18} /> Save Changes
          </PrimaryButton>
        </form>

        <form onSubmit={handleUpdatePassword}>
          <FormSection title="Security" icon={KeyRound} accentColor="text-violet-700">
            {savedPassword && (
              <div className="mb-4"><SuccessMessage>Password updated successfully.</SuccessMessage></div>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <PasswordField label="Current Password" name="currentPassword" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <PasswordField label="New Password" name="newPassword" placeholder="Enter new password" showStrength value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <PrimaryButton type="submit" fullWidth={false} className="mt-5 sm:self-start">
              <KeyRound size={18} /> Update Password
            </PrimaryButton>
          </FormSection>
        </form>
      </div>
    </AdminLayout>
  );
}
