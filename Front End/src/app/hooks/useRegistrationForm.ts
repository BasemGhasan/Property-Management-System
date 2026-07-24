// ============================================================================
// useRegistrationForm — shared state + validation for the common registration
// fields used by every role's registration page.
// ============================================================================

// Imports
import { useCallback, useState } from "react";
import {
  isValidEmail,
  isValidPhone,
  isRequired,
  hasMinLength,
} from "../services/validators";

// Interfaces
export interface CommonFields {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export type CommonErrors = Partial<Record<keyof CommonFields, string>>;

const EMPTY: CommonFields = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

// Hook
/**
 * Manages the shared registration fields, the accept-terms checkbox and
 * validation for fields common to all roles.
 */
export function useRegistrationForm() {
  const [fields, setFields] = useState<CommonFields>(EMPTY);
  const [errors, setErrors] = useState<CommonErrors>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Update a single field by key.
  const setField = useCallback(
    (key: keyof CommonFields, value: string) =>
      setFields((prev) => ({ ...prev, [key]: value })),
    []
  );

  // Validate common fields; returns the error map.
  const validateCommon = useCallback((): CommonErrors => {
    const next: CommonErrors = {};

    if (!isRequired(fields.fullName)) next.fullName = "Full name is required.";

    if (!isRequired(fields.email)) next.email = "Email is required.";
    else if (!isValidEmail(fields.email)) next.email = "Enter a valid email.";

    if (!isRequired(fields.phone)) next.phone = "Phone number is required.";
    else if (!isValidPhone(fields.phone)) next.phone = "Enter a valid phone number.";

    if (!isRequired(fields.password)) next.password = "Password is required.";
    else if (!hasMinLength(fields.password, 8))
      next.password = "Use at least 8 characters.";

    if (fields.confirmPassword !== fields.password)
      next.confirmPassword = "Passwords do not match.";

    return next;
  }, [fields]);

  return {
    fields,
    setField,
    errors,
    setErrors,
    acceptedTerms,
    setAcceptedTerms,
    validateCommon,
  };
}
