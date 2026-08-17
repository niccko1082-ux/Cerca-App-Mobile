// Importa el paquete i18next directo, no '@/i18n' — ese archivo trae
// expo-localization (y transitivamente react-native) para detectar el locale
// del dispositivo, algo que no existe ni hace falta en un entorno de tests
// (vitest/Node). Ambos imports apuntan al mismo singleton en tiempo de app real.
/* eslint-disable import/no-named-as-default-member -- patrón oficial de i18next (i18n.t). */
import i18n from 'i18next';
import { Money, Pricing } from '@/domain/listing/Listing';

// Cerca.md: dividir entre 100 está mal en general — el yen no tiene decimales,
// el dinar kuwaití tiene tres.
const MINOR_UNIT_DIGITS: Record<string, number> = {
  JPY: 0,
  KWD: 3,
  BHD: 3,
  OMR: 3,
};

export function minorUnitDigits(currency: string): number {
  return MINOR_UNIT_DIGITS[currency] ?? 2;
}

export function formatMoney(money: Money, locale?: string): string {
  const digits = minorUnitDigits(money.currency);
  const amount = money.amountMinor / 10 ** digits;
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(amount);
  return `${formattedNumber} ${money.currency}`;
}

// Convierte un texto decimal escrito por el usuario ("500.00") a unidades
// menores enteras, respetando los decimales reales de la moneda — el límite
// donde SÍ se permite un float, justo antes de entrar al dominio de Money.
export function parseAmountMinor(text: string, currency: string): number {
  const digits = minorUnitDigits(currency);
  const value = Number(text.replace(',', '.'));
  return Math.round(value * 10 ** digits);
}

// Inverso de parseAmountMinor — para prellenar un input de edición con el
// valor decimal que un humano espera ver, no las unidades menores crudas.
export function formatAmountInput(money: Money): string {
  const digits = minorUnitDigits(money.currency);
  return (money.amountMinor / 10 ** digits).toFixed(digits);
}

// priceFrom viene null del backend cuando el modelo es 'quote' sin startingFrom.
export function formatPriceFrom(priceFrom: Money | null, locale?: string): string {
  return priceFrom ? formatMoney(priceFrom, locale) : i18n.t('money.quoteOnRequest');
}

// Cerca.md: la distancia en km o millas según locale — 'us'/'uk' prefieren
// millas para distancias de trayecto aunque el resto de la unidad sea métrica.
export type MeasurementSystem = 'metric' | 'us' | 'uk';

export function formatDistance(
  meters: number,
  measurementSystem: MeasurementSystem = 'metric',
): string {
  if (measurementSystem === 'us' || measurementSystem === 'uk') {
    const miles = meters / 1609.344;
    return `a ${miles.toFixed(1)} mi`;
  }
  if (meters < 1000) return `a ${Math.round(meters)} m`;
  return `a ${(meters / 1000).toFixed(1)} km`;
}

// Cerca.md: el precio lleva su contexto — "$450 / hora · mínimo 2 h", no "$450".
export function formatPricing(pricing: Pricing, locale?: string): string {
  switch (pricing.model) {
    case 'fixed':
      return formatMoney(pricing.price, locale);
    case 'hourly':
      return i18n.t('money.perHour', {
        price: formatMoney(pricing.hourlyRate, locale),
        hours: pricing.minimumHours,
      });
    case 'quote':
      return pricing.startingFrom
        ? i18n.t('money.startingFrom', { price: formatMoney(pricing.startingFrom, locale) })
        : i18n.t('money.quoteOnRequest');
  }
}
