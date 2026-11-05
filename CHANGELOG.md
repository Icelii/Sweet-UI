# Changelog

All notable changes to this template. Versions follow [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-11-05

First public release.

### Added

- **Dashboard** with KPI cards and ApexCharts charts that follow the theme and the language.
- **Chat**: Messenger-style page and a floating chat button on every page.
- **Auth pages**: login, register, forgot password, reset password and two-factor code.
- **Account settings**, **404** page, global search (`Ctrl K`) and notifications panel.
- **UI components**, each with a demo page:
  - accordions, avatars, badges, breadcrumbs, buttons, cards, dropdowns;
  - lists, modals and dialogs, progress bars and rings, ribbons;
  - spinners and skeletons, tabs, timelines, tooltips and popovers.
- **Data**: form elements, form layouts, date picker, data tables and pagination (with [@icelii/ngx-api-paginator](https://www.npmjs.com/package/@icelii/ngx-api-paginator)).
- **Charts** page with sparkline, donut, radial and heatmap examples.
- **Themes and languages**: light, dark and system themes, and Spanish and English with translated page titles.
- **Brand config** (`src/app/core/config/brand.ts`) to change the app name and logo in one place.
- **Tooling**: ESLint with template accessibility rules (`npm run lint`) and Vitest unit tests (`npm test`).
- **Netlify deploy**: `netlify.toml` with server rendering and edge redirects for the start routes.
- **Docs**: README with screenshots and a "Make it yours" guide, and an MIT license.

### Performance

- **Smaller first download:** only the active language downloads, so the first download is 678 kB (143 kB compressed).
- **No unstyled flash:** the full stylesheet loads before the first paint.

[1.0.0]: https://github.com/Icelii/Sweet-UI/releases/tag/v1.0.0
