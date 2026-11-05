import type { ApexOptions } from 'apexcharts';

/**
 * Chart colors. The categorical slots come from the validated data-viz palette
 * (checked for color-blind separation and contrast on each surface), so use them
 * in this order and never cycle past the last one.
 */
const TOKENS = {
  light: {
    series: ['#2a78d6', '#eb6834', '#1baf7a'],
    muted: '#a8b2c1',
    surface: '#ffffff',
    grid: '#e2e8f0',
    text: '#1e293b',
    textMuted: '#64748b',
  },
  dark: {
    series: ['#3987e5', '#d95926', '#199e70'],
    muted: '#5b5f68',
    surface: '#212226',
    grid: '#34363c',
    text: '#f4f4f5',
    textMuted: '#a1a1aa',
  },
};

export type ChartTokens = (typeof TOKENS)['light'];

export function chartTokens(isDark: boolean): ChartTokens {
  return isDark ? TOKENS.dark : TOKENS.light;
}

type Plain = Record<string, unknown>;

function isPlain(value: unknown): value is Plain {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Deep merge where arrays and functions from `extra` replace the base value. */
function merge(base: Plain, extra: Plain): Plain {
  const result: Plain = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    result[key] = isPlain(value) && isPlain(result[key]) ? merge(result[key] as Plain, value) : value;
  }
  return result;
}

/** Shared look for every chart: thin marks, recessive grid, theme-aware text and tooltip. */
export function withChartDefaults(isDark: boolean, options: ApexOptions): ApexOptions {
  const t = chartTokens(isDark);
  const defaults: ApexOptions = {
    chart: {
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      foreColor: t.textMuted,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
      animations: { enabled: true, speed: 400 },
    },
    theme: { mode: isDark ? 'dark' : 'light' },
    colors: t.series,
    dataLabels: { enabled: false },
    grid: {
      borderColor: t.grid,
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      padding: { left: 8, right: 8, top: 0, bottom: 0 },
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: '12px' } },
    },
    yaxis: { labels: { style: { fontSize: '12px' } } },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '12px',
      fontWeight: 500,
      labels: { colors: t.text },
      markers: { size: 5, offsetX: -2, strokeWidth: 0 },
      itemMargin: { horizontal: 10, vertical: 0 },
    },
    tooltip: { theme: isDark ? 'dark' : 'light', style: { fontSize: '12px' } },
    states: { hover: { filter: { type: 'darken' } }, active: { filter: { type: 'none' } } },
  };
  return merge(defaults as Plain, options as Plain) as ApexOptions;
}
