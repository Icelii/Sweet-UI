# SweetUi

An admin dashboard template built with **Angular 22** (standalone components, signals, SSR and prerendering), **Tailwind CSS 4** and **daisyUI 5**. It has light and dark themes, works in Spanish and English, and is responsive from phones to wide screens.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://iceliiprojects.s3.us-west-004.backblazeb2.com/Sweet+UI+-+dark+theme.png" />
  <img alt="Sweet UI dashboard with KPI cards, charts and the sidebar menu" src="https://iceliiprojects.s3.us-west-004.backblazeb2.com/Sweet+UI+-+light+theme.png" />
</picture>

| Light theme | Dark theme |
| ----------- | ---------- |
| ![Sweet UI dashboard in the light theme](https://iceliiprojects.s3.us-west-004.backblazeb2.com/Sweet+UI+-+light+theme.png) | ![Sweet UI dashboard in the dark theme](https://iceliiprojects.s3.us-west-004.backblazeb2.com/Sweet+UI+-+dark+theme.png) |

## Features

- **Dashboard** with KPI cards and ApexCharts charts that follow the theme and the language.
- **Chat**: full Messenger-style page plus a floating chat button available on every page.
- **Authentication pages**: login, register, forgot password, reset password and two-factor code.
- **Account settings** and a **404** page.
- **UI elements**, each with its own demo page:
  - accordions, avatars, badges, breadcrumbs, buttons, cards, dropdowns;
  - lists and list groups, modals and dialogs, progress bars and rings;
  - ribbons, spinners and skeletons, tabs, timelines, tooltips and popovers.
- **Data**: form elements, form layouts, date picker, data tables and pagination.
- **Charts** page with sparklines, donut, radial and heatmap examples.
- **Light / dark / system theme**, saved per browser, with no flash on load.
- **Internationalization** (Spanish and English) with translated page titles.
- **Global search** (`Ctrl K`), notifications panel and a collapsible sidebar.
- **Accessibility**: keyboard navigation in menus and tabs, ARIA states, and support for reduced motion.
- **Ready to maintain**: ESLint with template accessibility rules, Vitest unit tests, and one file per component for styles and per area for translations.

## Getting started

Requirements: Node.js 22.22+ or 24.15+ (what Angular 22 supports) and npm.

```bash
npm install
npm start                  # dev server at http://localhost:4200
npm run build              # production build with SSR and prerendering
npm run serve:ssr:sweetUi  # serve the production build
npm test                   # unit tests with Vitest (watch mode)
npm run test:ci            # unit tests once, for CI
npm run lint               # ESLint for TypeScript and templates (includes accessibility rules)
npx prettier --write "src/**/*.{ts,html,css}"
```

Before publishing a change, run `npm run lint`, `npm run test:ci` and `npm run build`. The build warns when the first download goes over 750 kB.

## Make it yours

The template ships with demo pages and sample data so you can see every component working. These steps turn it into your own dashboard.

### 1. Name and logo

- Edit `src/app/core/config/brand.ts`: the name and logo files used in the sidebar, the login pages, the 404 page and the browser tab title.
- Put your logo files (light and dark versions) in `public/`.
- Update the static texts and icons in `src/index.html`: `<title>`, description, `og:*` tags and favicons.

### 2. Colors and fonts

- **Colors:** in `src/styles.css`, change `--color-primary` and the other colors inside the two `@plugin 'daisyui/theme'` blocks (light and dark). Everything else follows them.
- **Fonts:** change `--font-sans` / `--font-heading` in the `@theme` block and the Google Fonts link in `index.html`.

### 3. Remove the demo pages you don't need

Each demo page lives in its own folder under `src/app/features/ui/`. To remove one, for example tabs:

1. Delete `src/app/features/ui/tabs-demo/`.
2. Remove its route in `app.routes.ts` (`ui/tabs`).
3. Remove its link in `core/navigation/navigation.ts`.
4. Optionally delete its texts in `core/i18n/locales/es/demos.ts` and `en/demos.ts` (keys starting with `ui.tabs.`), plus `nav.tabs` and `title.tabs` in `app.ts`.

To remove **all** the demos at once, delete `features/ui/`, their routes and links, and empty both `demos.ts` files.

**Remove a component's styles too:** if you also delete a shared component, delete its file in `src/styles/` and its `@import` line in `styles.css`.

**Keep the shared component** (`src/app/shared/components/tabs/`) if you use it in your own pages. The build tells you if something still points to a deleted file.

### 4. Replace the sample data

These files hold sample data. Each one is marked with a comment that starts with `Sample`:

| What                     | File                                                        |
| ------------------------ | ----------------------------------------------------------- |
| Signed-in user           | `layouts/main-layout/components/user-menu/user-menu.ts`     |
| Notifications            | `layouts/main-layout/layout-state.ts`                       |
| Dashboard KPIs & charts  | `features/dashboard/dashboard.ts`                           |
| Chat conversations       | `features/chat/chat-store.ts`                               |
| Account settings form    | `features/profile/pages/profile/profile.ts`                 |

### 5. Connect your backend

The template is UI only: it has no HTTP calls, route guards or environment files yet.

1. Add `provideHttpClient()` to `app.config.ts` and create your services (for example in `src/app/core/services/`).
2. **Auth pages:** fill in `onSubmit()` in each page under `features/auth/pages/`. The places to call your API are marked with comments. Login currently goes straight to the dashboard as a demo.
3. **Route guards:** protect the main layout in `app.routes.ts` with a `canActivate` guard once you have a session.

## Project structure

```
src/app/
├── core/          # App-wide singletons
│   ├── config/brand.ts       # App name and logo
│   ├── i18n/                 # I18n service, page titles
│   │   └── locales/es|en/    # Texts: app, auth, components, dashboard, chat, demos
│   ├── navigation/           # Sidebar menu (edit navigation.ts)
│   └── services/theme.ts     # Light / dark / system theme
├── shared/        # Reusable, stateless pieces
│   ├── components/           # app-avatar, app-modal, app-dropdown, app-tabs, app-chart, …
│   ├── directives/ pipes/ validators/ utils/
├── layouts/       # Main layout (sidebar, topbar, floating chat), auth and settings layouts
└── features/      # Pages, lazy loaded from app.routes.ts
    ├── dashboard/  chat/  auth/  profile/  not-found/
    └── ui/                   # One demo page per component

src/styles.css     # Tailwind, daisyUI themes, colors and fonts
src/styles/        # One CSS file per component (buttons-badges.css, cards.css, …)
```

Tests live next to the code they check (`*.spec.ts`).

Import aliases (`tsconfig.json`): `@core/*`, `@shared/components/*`, `@shared/pipes/*`, `@layouts/*`, `@features/*` and more.

## Theming

Colors are defined in `src/styles.css` as two daisyUI themes (`light` and `dark`) plus a few CSS variables. Use these tokens instead of fixed colors so components work in both modes:

| Use                      | Token                                                          |
| ------------------------ | -------------------------------------------------------------- |
| App background           | `bg-base-200`                                                  |
| Surfaces (cards, panels) | `bg-base-100`                                                  |
| Text / secondary text    | `text-(--text-color)` / `text-(--secondary-text)`              |
| Borders                  | `border-(--border-color-1)/40`                                 |
| Brand color              | `--primary-color` (`bg-(--primary-color)`, …)                  |
| States                   | `primary`, `secondary`, `success`, `warning`, `error`, `info`  |

Shared component styles (`ui-btn`, `ui-badge`, `ui-card`, `ui-timeline`, …) live in `src/styles/`, one file per component, inside `@layer components`.

The `Theme` service (`@core/services/theme`) exposes:

- `mode()`: `'light' | 'dark' | 'system'` (default `system`)
- `current()` / `isDark()`: the theme on screen
- `toggle()` and `setMode(mode)`

The choice is stored in `localStorage` under `theme`. An inline script in `index.html` applies it before Angular loads, which avoids a flash. If you rename the key, change it in both places.

## Translations

Texts live in `src/app/core/i18n/locales/`, one folder per language and one file per area:

| File            | Texts                                                   |
| --------------- | ------------------------------------------------------- |
| `app.ts`        | Layout, menu, page titles, profile, 404                 |
| `auth.ts`       | Login, register, password and two-factor pages          |
| `components.ts` | Shared components: validation, date picker, select, … |
| `dashboard.ts`  | Dashboard                                               |
| `chat.ts`       | Chat                                                    |
| `demos.ts`      | Demo pages (safe to delete with them)                   |

- **Keys come from Spanish:** the Spanish files define the valid keys. A missing or extra key in English is a type error that points to the exact file.
- **One language per download:** only the language in use is downloaded. The other one loads when the user switches.
- **Startup:** the app waits for the texts before its first render, so no keys are ever shown.

```html
<h2>{{ 'nav.dashboard' | translate }}</h2>
```

In TypeScript, use `inject(I18n).t('key')`. The language is stored in `localStorage` under `lang`.

## Adding a page

1. Create the component in `src/app/features/<name>/`.
2. Register it as a child of `MainLayout` in `app.routes.ts` with `loadComponent` and a `title` key. The tab shows "<title> · <app name>".
3. Add its link in `core/navigation/navigation.ts`.
4. Add its texts to the same file in `locales/es/` and `locales/en/` (or a new file listed in each `index.ts`).

## Charts

Charts use [ApexCharts](https://apexcharts.com/) through the `app-chart` component:

```ts
protected readonly salesChart = computed<ApexOptions>(() =>
  withChartDefaults(this.theme.isDark(), {
    chart: { type: 'bar', height: 300 },
    series: [{ name: 'Sales', data: [12, 18, 9] }],
  }),
);
```

```html
<app-chart [options]="salesChart()" role="img" aria-label="Sales by month" />
```

- **Browser-only loading:** the library loads only in the browser, so SSR keeps working.
- **Shared style:** `withChartDefaults()` adds the shared font, grid, legend and series colors (`chart-theme.ts`).
- **Automatic updates:** the chart redraws when the options change.

## Chat

- **Sample data:** the chat page (`/chat`) and the floating button share `ChatStore` (`features/chat/chat-store.ts`). It holds sample conversations and a fake reply for the demo.
- **Connecting a backend:** replace `send()` with your API or WebSocket, and the UI keeps working.
- **Opening a conversation directly:** use `/chat?c=<id>`.

## Pagination

There are two options:

- **`app-pagination`** (`shared/components/pagination`): small and built into the template. Best when all the rows are already loaded, like the Tables page.
  ```html
  <app-pagination [(page)]="page" [total]="rows().length" [pageSize]="10" />
  ```
- **[@icelii/ngx-api-paginator](https://www.npmjs.com/package/@icelii/ngx-api-paginator)**: six styles and an event for each page change. Best when your API returns one page at a time, like the Pagination page.

`styles.css` maps the library's colors to the template theme (light and dark) and scans its classes with `@source`.

## Icons

Icons come from [Tabler Icons](https://tabler.io/icons) and are stored as SVG paths in `shared/components/tabler-icon/tabler-icon.ts`, so only the icons you use are shipped. To add one, copy its paths from tabler.io into the `ICONS` list. The instructions are at the top of that file.

```html
<app-tabler-icon name="bell" [size]="20" />
```

## Credits

- [Angular](https://angular.dev/), MIT License
- [Tailwind CSS](https://tailwindcss.com/), MIT License
- [daisyUI](https://daisyui.com/), MIT License
- [ApexCharts](https://apexcharts.com/), MIT License
- [Tabler Icons](https://tabler.io/icons), MIT License; paths are embedded in `tabler-icon.ts`
- [@icelii/ngx-api-paginator](https://github.com/Icelii/ngx-api-paginator) by Iceli, MIT License
- [Inter](https://rsms.me/inter/) and [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans), SIL Open Font License, served by Google Fonts

Demo photos belong to their authors and are only for preview. Replace them with your own images before using the template in production.

## Author

Made by **Iceli** · [iceli.dev](https://iceli.dev/) · [GitHub](https://github.com/Icelii)

## License

Released under the [MIT License](LICENSE). Third-party libraries, icons and fonts keep their own licenses (see [Credits](#credits)).
