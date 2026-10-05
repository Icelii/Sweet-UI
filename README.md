# SweetUi

Admin dashboard template built with **Angular 22**, **Tailwind CSS 4** and **daisyUI 5**.

## Features

- ⚡ Angular 22 with standalone components, signals, `OnPush` and SSR with prerendering
- 🧱 Ready-made main layout: collapsible sidebar with submenus, topbar, user menu and notifications panel
- 🎨 Light/dark/system theme, with no flash on load
- 🌐 Spanish/English i18n with type-checked keys and translated page titles
- 🧩 [Tabler](https://tabler.io/icons) icons as inline SVG, with type-checked names
- 🔗 Import aliases to avoid `../` relative paths

## Table of contents

- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [Import aliases](#import-aliases)
- [Layout](#layout)
- [Navigation](#navigation)
- [Adding a page](#adding-a-page)
- [Theming](#theming)
- [Internationalization](#internationalization)
- [Icons](#icons)
- [Shared pipes](#shared-pipes)

## Requirements

- Node.js (an LTS version supported by Angular 22)
- npm (the project declares `npm@12.0.2` in `packageManager`)

The Angular CLI is installed locally as a dev dependency, so the npm scripts below work without a global install. If you prefer to type `ng` directly, install it globally with `npm install -g @angular/cli`.

## Quick start

```bash
npm install
npm start      # dev server at http://localhost:4200
```

### Available scripts

| Script                       | Runs                                            | Description                                  |
| ---------------------------- | ----------------------------------------------- | -------------------------------------------- |
| `npm start`                  | `ng serve`                                      | Development server at `http://localhost:4200` |
| `npm run build`              | `ng build`                                      | Production build (SSR + prerender) in `dist/sweetUi` |
| `npm run watch`              | `ng build --watch --configuration development`  | Development build in watch mode              |
| `npm run serve:ssr:sweetUi`  | `node dist/sweetUi/server/server.mjs`           | Serve the SSR build (run `npm run build` first) |

All routes are prerendered (`RenderMode.Prerender` in `src/app/app.routes.server.ts`).

### Formatting

Prettier is configured in `.prettierrc` (`printWidth: 100`, single quotes, Angular parser for `.html`):

```bash
npx prettier --write "src/**/*.{ts,html,css}"
```

> [!NOTE]
> The template does not include unit tests, and `ng generate` is configured not to create `.spec.ts` files (see `schematics` in `angular.json`).

## Project structure

```text
src/
├── app/
│   ├── core/
│   │   ├── i18n/          # Translations dictionary, pipe and I18n service
│   │   ├── interfaces/    # Shared interfaces
│   │   ├── navigation/    # Navigation configuration
│   │   └── services/      # Global services (Theme, etc.)
│   ├── shared/            # Reusable components (e.g. tabler-icon)
│   ├── layouts/           # Application layouts
│   └── features/          # Feature modules
├── index.html             # Includes the script that applies the theme before Angular loads
└── styles.css             # daisyUI themes and custom variables
```

## Import aliases

Defined in `tsconfig.json`. Use them instead of relative `../` paths:

| Alias                   | Path                           |
| ----------------------- | ------------------------------ |
| `@core/i18n/*`          | `src/app/core/i18n/*`          |
| `@core/interfaces/*`    | `src/app/core/interfaces/*`    |
| `@core/navigation/*`    | `src/app/core/navigation/*`    |
| `@core/services/*`      | `src/app/core/services/*`      |
| `@shared/*`             | `src/app/shared/*`             |
| `@layouts/*`            | `src/app/layouts/*`            |
| `@layouts/interfaces/*` | `src/app/layouts/interfaces/*` |
| `@features/*`           | `src/app/features/*`           |

```ts
import { Theme } from '@core/services/theme';
import { TranslatePipe } from '@shared/pipes/translate-pipe';
```

## Layout

`MainLayout` (`@layouts/main-layout/main-layout`) is the shell for every page under the `''` route. It renders:

| Component             | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `app-sidebar`         | Logo, collapse button and menu built from `NAVIGATION`, with submenus       |
| `app-topbar`          | Theme toggle, notifications button and user menu (`mobile` / `desktop` variants) |
| `app-user-menu`       | Avatar (falls back to initials), language selector and log out              |
| `app-notifications-panel` | Side panel with unread count and "mark all as read"                     |
| `app-theme-toggle`    | Light/dark toggle button                                                    |

The UI state is shared through `LayoutState`, which is provided by `MainLayout` (not `root`):

| Member                                     | Description                          |
| ------------------------------------------ | ------------------------------------ |
| `isExpanded()` / `toggleSidebar()` / `expandSidebar()` | Desktop sidebar expanded/collapsed |
| `mobileOpen()` / `toggleMobileSidebar()` / `closeMobileSidebar()` | Mobile drawer        |
| `notificationsOpen()` / `toggleNotifications()` / `closeNotifications()` | Notifications panel |

> [!NOTE]
> The user (`UserMenu`) and the notifications (`NotificationsPanel`) are sample data defined as signals inside each component. Replace them with your own data source.

## Navigation

The sidebar menu is configured in `src/app/core/navigation/navigation.ts` as a list of sections:

```ts
export const NAVIGATION: NavSection[] = [
  {
    items: [{ path: '/home', label: 'nav.dashboard', icon: 'dashboard' }],
  },
  {
    title: 'nav.section.features',
    items: [
      {
        path: '/pages',
        label: 'nav.pages',
        icon: 'pages',
        children: [{ path: '/not-found', label: 'nav.404' }],
      },
    ],
  },
];
```

Types (`@core/interfaces/navigation`):

- `NavSection`: optional `title` (translation key) and `items`.
- `NavItem`: `label` (translation key), `path`, `icon` (`TablerIconName`) and optional `children`.
- `NavLink`: `label`, `path` and optional `match`, extra paths that also mark the link as active.

Since `label`, `title` and `icon` are typed, a missing translation key or icon is a compile error.

## Adding a page

1. Create the component in `src/app/features/<name>/`.
2. Add a lazy route as a child of `MainLayout` in `src/app/app.routes.ts`, using a translation key as the `title`:

   ```ts
   {
     path: '',
     title: 'title.home',
     component: MainLayout,
     children: [
       {
         path: 'home',
         title: 'title.home',
         loadComponent: () => import('@features/home/home').then((m) => m.Home),
       },
     ],
   },
   ```

3. Add the translation keys (`title.*`, `nav.*`, page texts) to `es` and `en` in `translations.ts`.
4. Add the entry to `NAVIGATION` (and the icon to `ICONS` if it doesn't exist yet).

> [!NOTE]
> The `MainLayout` route ships with no children: the menu already points to `/home`, but that page is yours to create. Unknown paths fall through to the `**` route (`NotFound`).

## Theming

Colors are defined as daisyUI themes (`light` and `dark`) in `src/styles.css`, with daisyUI's built-in themes disabled (`themes: false`). For a component to work in both modes, **always use tokens and never hard-coded colors**.

### Recommended tokens

| Use                   | Class                                                                   |
| --------------------- | ----------------------------------------------------------------------- |
| App background        | `bg-base-200`                                                           |
| Surfaces (cards)      | `bg-base-100`                                                           |
| Borders               | `border-base-300` or `border-(--border-color-1)`                        |
| Text / secondary text | `text-(--text-color)` / `text-(--secondary-text)`                       |
| Hover backgrounds     | `hover:bg-(--button-bg)`                                                |
| Brand and states      | `primary`, `secondary`, `accent`, `success`, `warning`, `error`, `info` |

### Custom variables and fonts

In addition to the daisyUI colors, `styles.css` defines per theme:

- **Variables:** `--primary-color`, `--text-color`, `--secondary-text`, `--border-color-1`, `--button-bg`, `--bg-2`, `--danger`
- **Fonts:** `font-sans` (Inter) and `font-heading` (Plus Jakarta Sans, applied to `h1`–`h4`). Both are loaded from Google Fonts in `index.html`.

Tailwind's `dark:` variant also follows the active theme.

### `Theme` service

Available at `@core/services/theme`:

| Member                   | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `mode()`                 | `'light' \| 'dark' \| 'system'` (defaults to `system`) |
| `current()` / `isDark()` | The theme currently being displayed                    |
| `toggle()`               | Switches between light and dark                        |
| `setMode(mode)`          | Sets the mode explicitly                               |

The service sets `data-theme` and `color-scheme` on `<html>` and reacts to system changes while in `system` mode. The preference is stored in `localStorage` under the key `theme` (`THEME_STORAGE_KEY`); choosing `system` removes the key. An inline script in `index.html` applies the theme before Angular loads to prevent flashing.

> [!IMPORTANT]
> If you change the `theme` key, update it in both `THEME_STORAGE_KEY` and the `index.html` script.

## Internationalization

Texts live in `src/app/core/i18n/translations.ts`:

- `es` is the base dictionary; its keys define the `TranslationKey` type.
- `en` is typed as `Dictionary`, so it must have exactly the same keys; TypeScript enforces this at compile time.
- Parameters use `{name}` placeholders, e.g. `'{count} unread'`.

The initial language is the one stored in `localStorage` (key `lang`). If there is none, English is used when the browser language starts with `en`, and Spanish otherwise. The active language is also set as `<html lang>`.

### In templates

Import `TranslatePipe` from `@shared/pipes/translate-pipe`:

```html
{{ 'notFound.title' | translate }}
{{ 'layout.unread' | translate: { count: 3 } }}
```

### In code

Inject `I18n` from `@core/i18n/i18n`:

```ts
i18n.t('notFound.title');          // t(key, params?)
i18n.t('layout.unread', { count: 3 });
i18n.language();                   // current language (signal)
i18n.languages;                    // ['es', 'en']
i18n.setLanguage('en');            // change language
i18n.toggle();                     // switch between es and en
```

### Route titles

Each route's `title` is a translation key, resolved by `TranslatedTitleStrategy`. The document title updates automatically when the language changes, and falls back to `SweetUi` when a route has no title.

### Adding a new text

1. Add the key to the `es` dictionary.
2. Add the same key to `en` (the compiler fails if it's missing).
3. Use it with the `translate` pipe or `t()`.

### Adding a language

1. Add the code to the `Language` type and a new `Dictionary` to `TRANSLATIONS` in `translations.ts`.
2. Add it to `LANGUAGES` in `i18n.ts` (and adjust `toggle()`, which only switches between `es` and `en`).
3. Add its name to `languageNames` in `UserMenu` and its flag to `FlagIcon`.

## Icons

The `app-tabler-icon` component renders [Tabler Icons](https://tabler.io/icons) as inline SVG. It uses `currentColor`, so it inherits the text color:

```html
<app-tabler-icon name="home" [size]="18" [stroke]="2" />
```

| Input    | Default | Description                  |
| -------- | ------- | ---------------------------- |
| `name`   | —       | Icon name (`TablerIconName`) |
| `size`   | `24`    | Width and height in px       |
| `stroke` | `2`     | Stroke width                 |

### Adding an icon

1. Find the icon at [tabler.io/icons](https://tabler.io/icons) and copy the `d` attribute of each `<path>`.
2. Add them to the `ICONS` object in `src/app/shared/components/tabler-icon/tabler-icon.ts`. Use `{ d: '...', fill: true }` for a path that must be filled instead of stroked.
3. The name is typed automatically (`TablerIconName`).

### Flags

`app-flag-icon` renders the flag for a language (`es` → Mexico, `en` → United States), used in the language selector:

```html
<app-flag-icon language="es" [size]="16" />
```

## Shared pipes

| Pipe        | Import                          | Description                                                         |
| ----------- | ------------------------------- | ------------------------------------------------------------------- |
| `translate` | `@shared/pipes/translate-pipe`  | Translates a key, with optional params                              |
| `initials`  | `@shared/pipes/initials-pipe`   | Two-letter initials from a name (`'Ana López'` → `AL`), `??` if empty |
