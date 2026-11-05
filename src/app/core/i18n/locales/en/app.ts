import type { app as es } from '../es/app';

/** English for ../es/app.ts. A missing or extra key is a type error. */
export const app: Record<keyof typeof es, string> = {
  'layout.openMenu': 'Open menu',
  'layout.closeMenu': 'Close menu',
  'layout.collapseMenu': 'Collapse menu',
  'layout.expandMenu': 'Expand menu',
  'layout.notifications': 'Notifications',
  'layout.closeNotifications': 'Close notifications',
  'layout.unread': '{count} unread',
  'layout.markAllRead': 'Mark all as read',
  'layout.profileSettings': 'Profile settings',
  'layout.logout': 'Log out',
  'layout.toggleTheme': 'Toggle theme',
  'layout.switchLanguage': 'Switch language',
  'layout.language': 'Language',
  'user.defaultName': 'User',
  'user.role.admin': 'Administrator',
  'nav.dashboard': 'Dashboard',
  'nav.pages': 'Pages',
  'nav.error-pages': 'Error pages',
  'nav.404': 'Error 404',
  'nav.section.extra': 'Extras',
  'nav.section.uiElements': 'UI Elements',
  'nav.section.data': 'Data',
  'nav.auth': 'Authentication',
  'nav.login': 'Sign in',
  'nav.register': 'Sign up',
  'nav.forgotPassword': 'Forgot password',
  'nav.resetPassword': 'Reset password',
  'nav.twoFactor': 'Two-factor verification',
  'nav.formElements': 'Form elements',
  'time.minutesAgo': '{count} min ago',
  'time.hoursAgo': '{count} h ago',
  'time.yesterday': 'Yesterday',
  'notifications.newOrder': 'A new order was received and is awaiting confirmation.',
  'notifications.reviewPending': 'A new review is pending moderation.',
  'notifications.couponExpiring': 'Coupon BIENVENIDA10 expires in 3 days.',
  'notifications.lowStock': 'Some catalog products are running low on stock.',
  'notifications.newUser': 'A new store manager has signed up.',
  'title.home': 'Dashboard',
  'title.notFound': 'Not found',
  'title.login': 'Sign in',
  'title.register': 'Create account',
  'title.forgotPassword': 'Forgot password',
  'title.resetPassword': 'Reset password',
  'title.changePassword': 'Change password',
  'title.twoFactor': 'Two-factor verification',
  'title.account-settings': 'Account Settings',
  'accountSettings.title': 'Account settings',
  'accountSettings.subtitle': 'Manage your account preferences.',
  'accountSettings.nav.profile': 'My profile',
  'accountSettings.nav.changePassword': 'Change password',
  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.saveChanges': 'Save changes',
  'common.optional': '(optional)',
  'profile.title': 'Profile information',
  'profile.subtitle': 'Update your personal details',
  'profile.field.phone': 'Phone',
  'profile.field.phonePlaceholder': 'e.g. 5512345678',
  'profile.field.birthdate': 'Date of birth',
  'profile.validation.phone': 'Enter a 10-digit phone number',
  'profile.delete.title': 'Delete account',
  'profile.delete.description': 'This action cannot be undone. You will lose access to the dashboard and all your sessions will be closed.',
  'profile.delete.button': 'Delete my account',
  'profile.delete.warningTitle': 'This action cannot be undone!',
  'profile.delete.warning': 'All your data will be permanently deleted.',
  'profile.delete.reason': 'Reason',
  'profile.delete.reasonPlaceholder': "Tell us why you're deleting your account",
  'profile.delete.confirmEmail': 'Type your email to confirm',
  'profile.delete.emailMismatch': "The email doesn't match",
  'profile.delete.submit': 'Delete account',
  'notFound.title': 'Page not found',
  'notFound.description': "The page you're looking for doesn't exist or isn't available yet.",
  'notFound.back': 'Back to home',
  'notFound.goBack': 'Go back',
  'notFound.code': 'Error 404',

  // Datepicker demo
  'nav.datepicker': 'Datepicker',
  'title.datepicker': 'Datepicker',

  // Select, dropzone and forms demo
  'nav.forms': 'Forms',
  'title.forms': 'Forms',

  // Form layouts demo
  'nav.formLayouts': 'Form layouts',
  'title.formLayouts': 'Form layouts',

  // Global search
  'search.placeholder': 'Search pages...',
  'search.open': 'Search',
  'search.empty': 'No results for "{query}"',
  'search.hintNavigate': 'move',
  'search.hintOpen': 'open',
  'search.hintClose': 'close',

  // Tables demo and pagination
  'nav.tables': 'Tables',
  'title.tables': 'Tables',

  // Buttons and badges demo
  'nav.buttons': 'Buttons',
  'nav.badges': 'Badges',
  'title.buttons': 'Buttons',
  'title.badges': 'Badges',

  // Avatars, modals and breadcrumbs
  'nav.avatars': 'Avatars',
  'nav.modals': 'Modals',
  'nav.breadcrumbs': 'Breadcrumbs',
  'title.avatars': 'Avatars',
  'title.modals': 'Modals',
  'title.breadcrumbs': 'Breadcrumbs',
  'common.accept': 'OK',
  'common.confirm': 'Confirm',

  // Dropdowns, lists, progress and ribbons
  'nav.dropdowns': 'Dropdowns',
  'nav.lists': 'Lists',
  'nav.progress': 'Progress',
  'nav.ribbons': 'Ribbons',
  'title.dropdowns': 'Dropdowns',
  'title.lists': 'Lists',
  'title.progress': 'Progress',
  'title.ribbons': 'Ribbons',

  // Spinners, tabs, tooltips and popovers
  'nav.spinners': 'Spinners',
  'nav.tabs': 'Tabs',
  'nav.tooltips': 'Tooltips & popovers',
  'title.spinners': 'Spinners',
  'title.tabs': 'Tabs',
  'title.tooltips': 'Tooltips & popovers',

  // Cards, timelines and accordions
  'nav.cards': 'Cards',
  'nav.timelines': 'Timelines',
  'nav.accordions': 'Accordions',
  'title.cards': 'Cards',
  'title.timelines': 'Timelines',
  'title.accordions': 'Accordions',

  // Pagination
  'nav.pagination': 'Pagination',
  'title.pagination': 'Pagination',

  // Charts
  'nav.charts': 'Charts',
  'title.charts': 'Charts',

  // Chat
  'nav.section.apps': 'Apps',
  'nav.chat': 'Chat',
  'title.chat': 'Chat',
};
