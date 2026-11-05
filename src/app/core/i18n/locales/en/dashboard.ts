import type { dashboard as es } from '../es/dashboard';

/** English for ../es/dashboard.ts. A missing or extra key is a type error. */
export const dashboard: Record<keyof typeof es, string> = {
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.subtitle': 'Summary of this month’s activity.',
  'dashboard.kpi.sales': 'Monthly sales',
  'dashboard.kpi.orders': 'Orders',
  'dashboard.kpi.customers': 'New customers',
  'dashboard.kpi.ticket': 'Average ticket',
  'dashboard.kpi.vsLastMonth': 'vs. last month',

  // Dashboard charts
  'dashboard.chart.thisYear': 'This year',
  'dashboard.chart.lastYear': 'Last year',
  'dashboard.chart.sales': 'Sales',
  'dashboard.chart.orders': 'Orders',
  'dashboard.chart.revenueTitle': 'Revenue by month',
  'dashboard.chart.revenueHint': 'January to October, compared with last year.',
  'dashboard.chart.categoriesTitle': 'Sales by category',
  'dashboard.chart.categoriesHint': 'This month, highest first.',
  'dashboard.chart.weekdayTitle': 'Orders by day',
  'dashboard.chart.weekdayHint': 'This month’s total by day of the week.',
  'dashboard.chart.channelsTitle': 'Orders by channel',
  'dashboard.chart.channelsHint': 'Last 6 months.',
  'dashboard.category.electronics': 'Electronics',
  'dashboard.category.home': 'Home',
  'dashboard.category.fashion': 'Fashion',
  'dashboard.category.beauty': 'Beauty',
  'dashboard.category.sports': 'Sports',
  'dashboard.channel.web': 'Website',
  'dashboard.channel.app': 'App',
  'dashboard.channel.store': 'In store',
};
