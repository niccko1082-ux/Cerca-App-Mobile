// src/utils/validators.ts

/**
 * Valida si una cadena tiene formato de correo electrónico válido.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida si la contraseña cumple con los requisitos del esquema de registro (singUpSchema):
 * - Mínimo 8 caracteres
 * - Al menos un número
 * - Al menos una letra mayúscula
 */
export function validatePasswordRequirements(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'La contraseña debe tener al menos 8 caracteres.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos un número.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra mayúscula.' };
  }
  return { isValid: true };
}
