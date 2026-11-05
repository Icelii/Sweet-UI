/**
 * Your app's name and logo. Change them here and they update in the sidebar,
 * the login pages, the 404 page and the browser tab title.
 * Logo files live in /public; also update the icons and texts in src/index.html.
 */
export const BRAND = {
  name: 'Sweet UI',
  logo: {
    light: 'logo/sweet-ui-icon-light.svg',
    dark: 'logo/sweet-ui-icon-dark.svg',
  },
} as const;

/** Logo for the theme on screen. */
export function brandLogo(isDark: boolean): string {
  return isDark ? BRAND.logo.dark : BRAND.logo.light;
}
