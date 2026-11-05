import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Group validator: sets `noMatch` on `confirmField` when it differs from `field`. */
export function matchFieldsValidator(field: string, confirmField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const control = group.get(field);
    const confirm = group.get(confirmField);
    if (!control || !confirm) return null;

    const { noMatch, ...otherErrors } = confirm.errors ?? {};
    const mismatch = !!confirm.value && control.value !== confirm.value;

    if (mismatch) {
      confirm.setErrors({ ...otherErrors, noMatch: true });
    } else if (noMatch) {
      confirm.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
    }

    return mismatch ? { noMatch: true } : null;
  };
}