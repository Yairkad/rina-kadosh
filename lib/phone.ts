export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function isValidPhone(value: string): boolean {
  return /^05\d{8}$/.test(value);
}

export const PHONE_ERROR_HE = "מספר טלפון חייב להתחיל ב-05 ולכלול 10 ספרות";
export const PHONE_ERROR_EN = "Phone must start with 05 and contain 10 digits";
