import { describe, expect, it } from 'vitest';

import { formatDistance } from './money';

describe('formatDistance', () => {
  it('usa metros para menos de 1 km en sistema métrico', () => {
    expect(formatDistance(850)).toBe('a 850 m');
  });

  it('usa kilómetros con un decimal en sistema métrico', () => {
    expect(formatDistance(3200)).toBe('a 3.2 km');
  });

  it('usa millas cuando el sistema de medida es "us" (Cerca.md: km o millas según locale)', () => {
    expect(formatDistance(1609.344, 'us')).toBe('a 1.0 mi');
  });

  it('usa millas también para "uk" (convención real: Reino Unido mide distancias de trayecto en millas)', () => {
    expect(formatDistance(1609.344, 'uk')).toBe('a 1.0 mi');
  });
});
