// ============================================================================
// validators — small pure helpers shared by the auth forms.
// ============================================================================

/** Basic email format check. */
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/** Loose phone check: digits, spaces, +, -, parentheses, 7-15 digits. */
export const isValidPhone = (phone: string): boolean =>
  /^[+\d][\d\s().-]{6,18}$/.test(phone.trim());

/** Required, non-empty (trimmed) value. */
export const isRequired = (value: string): boolean => value.trim().length > 0;

/** Minimum length helper. */
export const hasMinLength = (value: string, min: number): boolean =>
  value.length >= min;
