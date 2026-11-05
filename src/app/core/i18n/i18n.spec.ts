import { TestBed } from '@angular/core/testing';
import { I18n } from './i18n';

describe('I18n', () => {
  let i18n: I18n;

  beforeEach(async () => {
    i18n = TestBed.inject(I18n);
    await i18n.ready;
    await i18n.setLanguage('es');
  });

  it('translates a key in the current language', () => {
    expect(i18n.t('common.cancel')).toBe('Cancelar');
  });

  it('fills in {params}', () => {
    expect(i18n.t('auth.copyright', { year: 2026, app: 'Sweet UI' })).toBe('©2026 Sweet UI. Todos los derechos reservados');
  });

  it('switches every text after downloading the other language', async () => {
    await i18n.setLanguage('en');
    expect(i18n.language()).toBe('en');
    expect(i18n.t('common.cancel')).toBe('Cancel');
  });
});
