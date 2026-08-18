import { describe, expect, it } from 'vitest';

import { Actor, can, has } from './actor';

function makeActor(overrides: Partial<Actor> = {}): Actor {
  return {
    id: 'actor-1',
    capacities: [],
    platformRole: 'user',
    ...overrides,
  };
}

describe('has', () => {
  it('es true cuando el actor tiene la capacidad', () => {
    expect(has(makeActor({ capacities: ['customer'] }), 'customer')).toBe(true);
  });

  it('es false cuando el actor no tiene la capacidad', () => {
    expect(has(makeActor({ capacities: ['customer'] }), 'provider')).toBe(false);
  });

  it('un actor puede tener las dos capacidades a la vez (Marta, el ejemplo de Cerca.md)', () => {
    const marta = makeActor({ capacities: ['customer', 'provider'] });
    expect(has(marta, 'customer')).toBe(true);
    expect(has(marta, 'provider')).toBe(true);
  });
});

describe('can', () => {
  it('un usuario sin capacidades y sin rol de plataforma no puede hacer nada de la matriz', () => {
    const actor = makeActor();
    expect(can(actor, 'listing:read')).toBe(false);
    expect(can(actor, 'booking:request')).toBe(false);
  });

  it('customer: puede leer anuncios, reservar y reseñar, pero no crear anuncios', () => {
    const actor = makeActor({ capacities: ['customer'] });
    expect(can(actor, 'listing:read')).toBe(true);
    expect(can(actor, 'booking:request')).toBe(true);
    expect(can(actor, 'review:write')).toBe(true);
    expect(can(actor, 'listing:create')).toBe(false);
    expect(can(actor, 'booking:accept')).toBe(false);
  });

  it('provider: además puede crear/editar anuncios y aceptar reservas', () => {
    const actor = makeActor({ capacities: ['provider'] });
    expect(can(actor, 'listing:create')).toBe(true);
    expect(can(actor, 'listing:update')).toBe(true);
    expect(can(actor, 'booking:accept')).toBe(true);
  });

  it('un moderator sin capacidades igual puede moderar y resolver reportes por su rol de plataforma', () => {
    const actor = makeActor({ platformRole: 'moderator' });
    expect(can(actor, 'listing:moderate')).toBe(true);
    expect(can(actor, 'review:moderate')).toBe(true);
    expect(can(actor, 'report:resolve')).toBe(true);
    // Cerca.md: moderator no tiene listing:create ni user:suspend.
    expect(can(actor, 'listing:create')).toBe(false);
    expect(can(actor, 'user:suspend')).toBe(false);
  });

  it('un admin sin capacidades puede suspender usuarios y todo lo de moderator', () => {
    const actor = makeActor({ platformRole: 'admin' });
    expect(can(actor, 'user:suspend')).toBe(true);
    expect(can(actor, 'listing:moderate')).toBe(true);
    expect(can(actor, 'listing:create')).toBe(true);
  });

  it('un moderador también contrata servicios como cualquiera (rol de plataforma + capacidad de customer)', () => {
    const actor = makeActor({ platformRole: 'moderator', capacities: ['customer'] });
    expect(can(actor, 'booking:request')).toBe(true);
    expect(can(actor, 'report:resolve')).toBe(true);
    // El rol de plataforma no le da permisos de proveedor.
    expect(can(actor, 'listing:create')).toBe(false);
  });
});
