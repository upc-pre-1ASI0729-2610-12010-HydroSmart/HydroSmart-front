/**
 * Shared Kernel — Value Object Base
 *
 * Pertenece a: shared/domain/base
 * Por qué aquí: los Value Objects son inmutables y su igualdad se basa
 * en el valor de sus propiedades, no en identidad. Conceptos como WaterVolume,
 * MonthlyBudget y ConsumptionRange extienden esta clase para garantizar
 * inmutabilidad e igualdad estructural.
 */
export abstract class ValueObject<TProps extends object> {
  protected readonly props: TProps;

  protected constructor(props: TProps) {
    this.props = Object.freeze({ ...props });
  }

  equals(other: ValueObject<TProps>): boolean {
    if (other === null || other === undefined) return false;
    if (other.constructor.name !== this.constructor.name) return false;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
