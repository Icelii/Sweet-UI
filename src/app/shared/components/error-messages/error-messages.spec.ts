import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { I18n } from '@core/i18n/i18n';
import { ErrorMessages } from './error-messages';

describe('ErrorMessages', () => {
  async function render(control: FormControl) {
    const i18n = TestBed.inject(I18n);
    await i18n.ready;
    await i18n.setLanguage('es');
    const fixture = TestBed.createComponent(ErrorMessages);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'El correo');
    await fixture.whenStable();
    return fixture;
  }

  it('stays hidden until the field is touched', async () => {
    const control = new FormControl('', Validators.required);
    const fixture = await render(control);
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('shows the translated error once the field is touched', async () => {
    const control = new FormControl('', Validators.required);
    const fixture = await render(control);

    control.markAsTouched();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('El correo');
  });

  it('lists every error of the control', async () => {
    const control = new FormControl('ab', [Validators.email, Validators.minLength(5)]);
    const fixture = await render(control);

    control.markAsDirty();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('small')).toHaveLength(2);
  });

  it('hides again when the value becomes valid', async () => {
    const control = new FormControl('', Validators.required);
    const fixture = await render(control);

    control.markAsTouched();
    control.setValue('ana@example.com');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('small')).toBeNull();
  });
});
