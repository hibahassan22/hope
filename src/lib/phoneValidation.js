/** أقصى طول لرقم جوال سعودي محلي (05xxxxxxxx) */
export const SAUDI_PHONE_MAX_LEN = 10;

/** يبقي أرقاماً فقط ويحدّ الطول */
export function sanitizePhoneInput(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.slice(0, SAUDI_PHONE_MAX_LEN);
}

/**
 * تحقق من رقم جوال سعودي:
 * - 10 أرقام تبدأ بـ 05
 * - أو 9 أرقام تبدأ بـ 5
 */
export function validatePhone(phone) {
  const digits = sanitizePhoneInput(phone);

  if (!digits) {
    return { valid: false, message: "رقم الهاتف مطلوب" };
  }

  if (digits.length < 9) {
    return { valid: false, message: "رقم الهاتف قصير جداً" };
  }

  if (digits.length === 10) {
    if (!digits.startsWith("05")) {
      return { valid: false, message: "الرقم المحلي يجب أن يبدأ بـ 05" };
    }
    return { valid: true, normalized: digits };
  }

  if (digits.length === 9) {
    if (!digits.startsWith("5")) {
      return { valid: false, message: "رقم الجوال يجب أن يبدأ بـ 5" };
    }
    return { valid: true, normalized: `0${digits}` };
  }

  return {
    valid: false,
    message: `رقم الهاتف يجب أن يكون 9 أو ${SAUDI_PHONE_MAX_LEN} أرقام`,
  };
}
