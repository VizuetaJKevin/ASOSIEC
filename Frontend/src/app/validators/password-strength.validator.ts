import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador de fortaleza de contraseña
 * Requiere: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Si está vacío, lo maneja el Validators.required
    }

    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    const passwordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    if (!passwordValid) {
      return {
        passwordStrength: {
          hasMinLength,
          hasUpperCase,
          hasLowerCase,
          hasNumber,
          hasSpecialChar
        }
      };
    }

    return null;
  };
}

/**
 * Calcula la fortaleza de la contraseña (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0;

  let strength = 0;

  // Longitud
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;

  // Complejidad
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;

  return Math.min(strength, 100);
}

/**
 * Obtiene la etiqueta de fortaleza
 */
export function getPasswordStrengthLabel(strength: number): string {
  if (strength === 0) return '';
  if (strength < 40) return 'Débil';
  if (strength < 60) return 'Media';
  if (strength < 80) return 'Buena';
  return 'Excelente';
}

/**
 * Obtiene el color según la fortaleza
 */
export function getPasswordStrengthColor(strength: number): string {
  if (strength === 0) return 'secondary';
  if (strength < 40) return 'danger';
  if (strength < 60) return 'warning';
  if (strength < 80) return 'info';
  return 'success';
}
