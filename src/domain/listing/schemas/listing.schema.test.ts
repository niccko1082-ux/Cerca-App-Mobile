import { describe, expect, it } from 'vitest';

import { listingDetailSchema, listingSummarySchema } from './listing.schema';

// Fixtures tomados literal de respuestas reales del backend de desarrollo
// (verificadas con curl durante la construcción de estas pantallas).

describe('listingDetailSchema', () => {
  it('parsea un anuncio con pricing fixed', () => {
    const raw = {
      id: 'bbad2531-936d-4663-93d1-e980bb3a12e1',
      ownerId: '14b941d3-aba6-4f79-a3cc-5e2a60950f57',
      categoryId: '97c14e49-36c6-4031-8e61-1d1fa1627833',
      title: 'QA Test Listing',
      description: 'Anuncio de prueba QA para verificar el contrato.',
      pricing: { model: 'fixed', price: { amountMinor: 50000, currency: 'MXN' } },
      priceFrom: { amountMinor: 50000, currency: 'MXN' },
      status: 'published',
      ratingAvg: 0,
      ratingCount: 0,
      createdAt: '2026-08-12T23:55:25.644Z',
    };
    expect(() => listingDetailSchema.parse(raw)).not.toThrow();
  });

  // Regresión: un anuncio 'quote' sin startingFrom devuelve priceFrom: null,
  // no un objeto Money — este caso real rompió varias tarjetas antes del fix.
  it('parsea un anuncio con pricing quote y priceFrom null sin lanzar', () => {
    const raw = {
      id: '5d14384a-b020-413d-a8f6-94a03d52a2bb',
      ownerId: '14b941d3-aba6-4f79-a3cc-5e2a60950f57',
      categoryId: '3f35f4fe-a83e-4378-8548-ede402c6081a',
      title: 'Prueba wizard cotizacion',
      description: 'Sin precio fijo.',
      pricing: { model: 'quote' },
      priceFrom: null,
      status: 'draft',
      ratingAvg: 0,
      ratingCount: 0,
      createdAt: '2026-08-13T00:46:02.909Z',
    };
    const parsed = listingDetailSchema.parse(raw);
    expect(parsed.priceFrom).toBeNull();
    expect(parsed.pricing).toEqual({ model: 'quote' });
  });

  it('rechaza una respuesta sin los campos requeridos (el límite se valida con parse, no con "as")', () => {
    const raw = { id: 'x', title: 'Incompleto' };
    expect(() => listingDetailSchema.parse(raw)).toThrow();
  });
});

describe('listingSummarySchema', () => {
  it('parsea un resultado de búsqueda con distancia', () => {
    const raw = {
      id: 'bbad2531-936d-4663-93d1-e980bb3a12e1',
      title: 'QA Test Listing',
      categoryId: '97c14e49-36c6-4031-8e61-1d1fa1627833',
      priceFrom: { amountMinor: 50000, currency: 'MXN' },
      status: 'published',
      ratingAvg: 0,
      ratingCount: 0,
      distanceMeters: 0,
    };
    expect(() => listingSummarySchema.parse(raw)).not.toThrow();
  });

  it('parsea un resultado de búsqueda con priceFrom null (modelo quote)', () => {
    const raw = {
      id: 'listing-quote',
      title: 'Cotización a solicitud',
      categoryId: 'cat-1',
      priceFrom: null,
      status: 'published',
      ratingAvg: 0,
      ratingCount: 0,
    };
    expect(() => listingSummarySchema.parse(raw)).not.toThrow();
  });
});
