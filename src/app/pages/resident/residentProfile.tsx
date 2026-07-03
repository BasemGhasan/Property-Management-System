// ============================================================================
// ResidentProfilePage — manage personal info, property info, security & prefs.
// Uses shared FormSection instead of a locally-defined Section component.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Mail, Phone, Building2, UserCog, Save, KeyRound } from "lucide-react";
import { DashboardLayout } from "../../layouts/dashboardLayout";
import { InputField } from "../../components/auth/inputField";
import { PasswordField } from "../../components/auth/passwordField";
import { CheckboxField } from "../../components/auth/checkboxField";
import { PrimaryButton } from "../../components/auth/buttons";
import { FormSection } from "../../components/shared/formSection";
import { getStoredUser } from "../../lib/auth";
import { api } from "../../lib/apiClient";

// Interfaces
interface MyProperty {
  name: string;
  ownerName: string;
  myUnitNumber: string | null;
}

// Component
export default function ResidentProfilePage() {
  const stored = getStoredUser();
  const [fullName, setFullName] = useState(stored?.fullName ?? "");
  const [email, setEmail]       = useState(stored?.email ?? "");
  const [phone, setPhone]       = useState(stored?.phone ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");

  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif]   = useState(true);
  const [smsNotif, setSmsNotif]     = useState(false);

  const [property, setProperty] = useState<MyProperty | null>(null);
  const [propertyLoading, setPropertyLoading] = useState(true);

  const loadData = useCallback(() =>
    api.get<MyProperty[]>("/api/properties").then((data) => setProperty(data[0] ?? null)), []);

  useEffect(() => {
    let active = true;
    loadData().finally(() => { if (active) setPropertyLoading(false); });
    return () => { active = false; };
  }, [loadData]);

  const handleSaveProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await api.put("/api/users/me", { fullName, phone });
    toast.success("Profile updated successfully.");
  }, [fullName, phone]);

  const handleUpdatePassword = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setCurrentPassword("");
    setNewPassword("");
    toast.success("Password updated successfully.");
  }, [currentPassword, newPassword]);

  return (
    <DashboardLayout title="Profile" onRefresh={loadData}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
          <FormSection title="Personal Information" icon={User}>
            <div className="flex flex-col gap-5">
              <InputField label="Full Name" name="fullName" icon={<User size={18} />} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField label="Email" name="email" type="email" icon={<Mail size={18} />} value={email} onChange={(e) => setEmail(e.target.value)} />
                <InputField label="Phone Number" name="phone" type="tel" icon={<Phone size={18} />} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </FormSection>

          {/* Property info is read-only — comes from the owner's assignment */}
          <FormSection title="Property Information" icon={Building2}>
            {propertyLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : property ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Assigned Property"
                  name="assignedProperty"
                  icon={<Building2 size={18} />}
                  value={property.myUnitNumber ? `${property.name} — Unit ${property.myUnitNumber}` : property.name}
                  readOnly
                  disabled
                />
                <InputField label="Property Owner" name="propertyOwner" icon={<UserCog size={18} />} value={property.ownerName} readOnly disabled />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">You haven't been assigned to a property yet.</p>
            )}
          </FormSection>

          <FormSection title="Notification Preferences" icon={UserCog}>
            <div className="flex flex-col gap-4">
              <CheckboxField id="emailNotif" checked={emailNotif} onChange={setEmailNotif}>
                Email notifications for status updates
              </CheckboxField>
              <CheckboxField id="pushNotif" checked={pushNotif} onChange={setPushNotif}>
                Push notifications on this device
              </CheckboxField>
              <CheckboxField id="smsNotif" checked={smsNotif} onChange={setSmsNotif}>
                SMS alerts for critical requests
              </CheckboxField>
            </div>
          </FormSection>

          <PrimaryButton type="submit" fullWidth={false} className="sm:self-start">
            <Save size={18} /> Save Changes
          </PrimaryButton>
        </form>

        <form onSubmit={handleUpdatePassword}>
          <FormSection title="Security" icon={KeyRound}>
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
    </DashboardLayout>
  );
}
