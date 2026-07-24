// ============================================================================
// CommonRegistrationFields — renders the shared registration inputs reused by
// every role's registration page.
// ============================================================================

// Imports
import { User, Mail, Phone } from "lucide-react";
import { InputField } from "./inputField";
import { PasswordField } from "./passwordField";
import type {
  CommonFields,
  CommonErrors,
} from "../../hooks/useRegistrationForm";

// Interfaces
interface CommonRegistrationFieldsProps {
  fields: CommonFields;
  errors: CommonErrors;
  setField: (key: keyof CommonFields, value: string) => void;
}

// Component
export function CommonRegistrationFields({
  fields,
  errors,
  setField,
}: CommonRegistrationFieldsProps) {
  return (
    <>
      <InputField
        label="Full Name"
        name="fullName"
        placeholder="Jane Doe"
        icon={<User size={18} />}
        value={fields.fullName}
        error={errors.fullName}
        onChange={(e) => setField("fullName", e.target.value)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          value={fields.email}
          error={errors.email}
          onChange={(e) => setField("email", e.target.value)}
        />

        <InputField
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="+1 555 000 0000"
          icon={<Phone size={18} />}
          value={fields.phone}
          error={errors.phone}
          onChange={(e) => setField("phone", e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordField
          label="Password"
          name="password"
          placeholder="Create a password"
          showStrength
          value={fields.password}
          error={errors.password}
          onChange={(e) => setField("password", e.target.value)}
        />

        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Re-enter password"
          value={fields.confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => setField("confirmPassword", e.target.value)}
        />
      </div>
    </>
  );
}
