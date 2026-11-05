import { TranslationKey } from '@core/i18n/translations';

export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type DiscountScope = 'ALL' | 'CATEGORY' | 'PRODUCT' | 'BRAND';
export type DiscountState = 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'INACTIVE';

export interface Discount {
  id: number;
  name: string;
  description: string;
  type: DiscountType;
  value: number;
  scope: DiscountScope;
  /** Category, product or brand it applies to (null when it applies to everything). */
  target: string | null;
  since: Date | null;
  to: Date | null;
  active: boolean;
  maxUsages: number | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export const SCOPE_LABELS: Record<DiscountScope, TranslationKey> = {
  ALL: 'tables.scope.all',
  CATEGORY: 'tables.scope.category',
  PRODUCT: 'tables.scope.product',
  BRAND: 'tables.scope.brand',
};

export const STATE_LABELS: Record<DiscountState, TranslationKey> = {
  ACTIVE: 'tables.state.active',
  SCHEDULED: 'tables.state.scheduled',
  EXPIRED: 'tables.state.expired',
  INACTIVE: 'tables.state.inactive',
};

/**
 * Badge colors per state, built on the theme tokens so they work in light and dark mode.
 * The text color is mixed with the theme text color so light tones stay readable.
 */
export const STATE_CLASSES: Record<DiscountState, string> = {
  ACTIVE: 'bg-success/15 text-[color:color-mix(in_oklab,var(--color-success),var(--text-color)_40%)] border-success/30',
  SCHEDULED: 'bg-info/15 text-[color:color-mix(in_oklab,var(--color-info),var(--text-color)_40%)] border-info/30',
  EXPIRED: 'bg-(--danger)/10 text-(--danger) border-(--danger)/30',
  INACTIVE: 'bg-(--bg-2) text-(--secondary-text) border-(--border-color-1)/60',
};

export function discountState(discount: Discount, now = new Date()): DiscountState {
  if (!discount.active) return 'INACTIVE';
  if (discount.since && discount.since > now) return 'SCHEDULED';
  if (discount.to && discount.to < now) return 'EXPIRED';
  return 'ACTIVE';
}

const day = (offset: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
};

const SEED: Omit<Discount, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Buen Fin 2026', description: 'Descuento general por temporada', type: 'PERCENTAGE', value: 20, scope: 'ALL', target: null, since: day(-2), to: day(12), active: true, maxUsages: 5000 },
  { name: 'Bienvenida', description: 'Primera compra de clientes nuevos', type: 'FIXED', value: 150, scope: 'ALL', target: null, since: null, to: null, active: true, maxUsages: null },
  { name: 'Audio al 15%', description: 'Audífonos y bocinas seleccionados', type: 'PERCENTAGE', value: 15, scope: 'CATEGORY', target: 'Electrónica', since: day(-10), to: day(5), active: true, maxUsages: 800 },
  { name: 'Navidad anticipada', description: 'Campaña de diciembre', type: 'PERCENTAGE', value: 25, scope: 'ALL', target: null, since: day(28), to: day(55), active: true, maxUsages: 3000 },
  { name: 'Liquidación verano', description: 'Ropa de temporada pasada', type: 'PERCENTAGE', value: 40, scope: 'CATEGORY', target: 'Moda', since: day(-120), to: day(-30), active: true, maxUsages: null },
  { name: 'Hogar inteligente', description: 'Focos y enchufes inteligentes', type: 'FIXED', value: 200, scope: 'CATEGORY', target: 'Hogar', since: day(-5), to: day(25), active: true, maxUsages: 400 },
  { name: 'Marca del mes', description: '', type: 'PERCENTAGE', value: 10, scope: 'BRAND', target: 'Sonora Audio', since: day(-1), to: day(29), active: true, maxUsages: null },
  { name: 'Envío a cuenta', description: 'Bonificación equivalente al envío', type: 'FIXED', value: 99, scope: 'ALL', target: null, since: null, to: day(40), active: false, maxUsages: null },
  { name: 'Tenis Runner', description: 'Modelo Runner Pro, todas las tallas', type: 'PERCENTAGE', value: 30, scope: 'PRODUCT', target: 'Tenis Runner Pro', since: day(-3), to: day(4), active: true, maxUsages: 120 },
  { name: 'Belleza 2x1', description: 'Equivale a 50% en el segundo artículo', type: 'PERCENTAGE', value: 50, scope: 'CATEGORY', target: 'Belleza', since: day(7), to: day(14), active: true, maxUsages: 600 },
  { name: 'Cupón app', description: 'Solo compras desde la app', type: 'FIXED', value: 100, scope: 'ALL', target: null, since: day(-30), to: day(60), active: true, maxUsages: 10000 },
  { name: 'Deportes fin de semana', description: '', type: 'PERCENTAGE', value: 12, scope: 'CATEGORY', target: 'Deportes', since: day(-60), to: day(-20), active: true, maxUsages: null },
  { name: 'Smartwatch S3', description: 'Precio especial de lanzamiento', type: 'FIXED', value: 500, scope: 'PRODUCT', target: 'Smartwatch S3', since: day(-4), to: day(10), active: true, maxUsages: 250 },
  { name: 'Clientes VIP', description: 'Nivel oro y platino', type: 'PERCENTAGE', value: 18, scope: 'ALL', target: null, since: null, to: null, active: false, maxUsages: null },
  { name: 'Casa Nórdica', description: 'Línea de muebles', type: 'PERCENTAGE', value: 22, scope: 'BRAND', target: 'Casa Nórdica', since: day(3), to: day(33), active: true, maxUsages: null },
  { name: 'Regreso a clases', description: 'Mochilas y papelería', type: 'PERCENTAGE', value: 15, scope: 'CATEGORY', target: 'Papelería', since: day(-90), to: day(-60), active: false, maxUsages: 2000 },
  { name: 'Cafetera Barista', description: '', type: 'FIXED', value: 350, scope: 'PRODUCT', target: 'Cafetera Barista X', since: day(-8), to: day(22), active: true, maxUsages: 90 },
  { name: 'Hot Sale', description: 'Evento nacional de ventas en línea', type: 'PERCENTAGE', value: 30, scope: 'ALL', target: null, since: day(-200), to: day(-190), active: true, maxUsages: 8000 },
  { name: 'Lumen Beauty', description: 'Toda la marca', type: 'PERCENTAGE', value: 20, scope: 'BRAND', target: 'Lumen Beauty', since: day(-6), to: day(8), active: true, maxUsages: null },
  { name: 'Recompensa reseña', description: 'Por dejar una reseña con foto', type: 'FIXED', value: 50, scope: 'ALL', target: null, since: null, to: null, active: true, maxUsages: null },
  { name: 'Gaming week', description: 'Consolas y accesorios', type: 'PERCENTAGE', value: 10, scope: 'CATEGORY', target: 'Electrónica', since: day(14), to: day(21), active: true, maxUsages: 1500 },
  { name: 'Jardín', description: 'Herramientas y macetas', type: 'FIXED', value: 80, scope: 'CATEGORY', target: 'Hogar', since: day(-15), to: day(15), active: false, maxUsages: null },
  { name: 'Mochila Trail 30L', description: '', type: 'PERCENTAGE', value: 35, scope: 'PRODUCT', target: 'Mochila Trail 30L', since: day(-2), to: day(6), active: true, maxUsages: 60 },
  { name: 'Aniversario', description: 'Celebramos 5 años', type: 'PERCENTAGE', value: 15, scope: 'ALL', target: null, since: day(45), to: day(52), active: true, maxUsages: null },
];

export function sampleDiscounts(): Discount[] {
  return SEED.map((discount, index) => ({
    ...discount,
    id: index + 1,
    createdAt: day(-(index * 7 + 30)),
    updatedAt: index % 3 === 0 ? day(-(index + 1)) : null,
  }));
}