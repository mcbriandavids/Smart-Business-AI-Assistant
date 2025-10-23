// Shared validation utilities
// Strong password: min 8 chars, includes upper, lower, number, special
export const STRONG_PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
