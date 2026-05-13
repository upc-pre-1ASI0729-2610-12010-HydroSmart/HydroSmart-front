/**
 * Shared Kernel — Entity Base
 *
 * Pertenece a: shared/domain/base
 * Por qué aquí: toda entidad del dominio tiene identidad única y lógica de igualdad
 * basada en ID, no en referencias de objeto. Esta clase establece esa invariante.
 */
export abstract class Entity<TId = string> {
  constructor(public readonly id: TId) {}

  equals(other: Entity<TId>): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    if (this.constructor.name !== other.constructor.name) return false;
    return this.id === other.id;
  }

  toString(): string {
    return `${this.constructor.name}(${this.id})`;
  }
}
