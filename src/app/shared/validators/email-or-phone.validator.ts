import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function emailOrPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const phoneRegex = /^(\+52)?\s?[0-9]{10}$/;

    const isEmail = emailRegex.test(value);
    const isPhone = phoneRegex.test(value);

    return isEmail || isPhone
      ? null
      : { emailOrPhone: true };
  };
}