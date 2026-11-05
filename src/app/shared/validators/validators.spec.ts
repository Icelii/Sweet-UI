import { FormControl, FormGroup } from '@angular/forms';
import { emailOrPhoneValidator } from './email-or-phone.validator';
import { matchFieldsValidator } from './match-fields.validator';

describe('emailOrPhoneValidator', () => {
  const validate = (value: string) => emailOrPhoneValidator()(new FormControl(value));

  it('accepts an email', () => {
    expect(validate('ana@example.com')).toBeNull();
  });

  it('accepts a 10-digit phone, with or without +52', () => {
    expect(validate('5512345678')).toBeNull();
    expect(validate('+52 5512345678')).toBeNull();
  });

  it('leaves empty values to the required validator', () => {
    expect(validate('')).toBeNull();
  });

  it('rejects anything else', () => {
    expect(validate('ana@example')).toEqual({ emailOrPhone: true });
    expect(validate('12345')).toEqual({ emailOrPhone: true });
  });
});

describe('matchFieldsValidator', () => {
  function form(password: string, confirm: string) {
    return new FormGroup(
      { password: new FormControl(password), confirm: new FormControl(confirm) },
      { validators: matchFieldsValidator('password', 'confirm') },
    );
  }

  it('marks the confirm field when the values differ', () => {
    const group = form('secret', 'other');
    expect(group.errors).toEqual({ noMatch: true });
    expect(group.controls.confirm.errors).toEqual({ noMatch: true });
  });

  it('clears the error once the values match', () => {
    const group = form('secret', 'other');
    group.controls.confirm.setValue('secret');
    expect(group.errors).toBeNull();
    expect(group.controls.confirm.errors).toBeNull();
  });

  it('waits until the confirm field has a value', () => {
    expect(form('secret', '').errors).toBeNull();
  });
});
