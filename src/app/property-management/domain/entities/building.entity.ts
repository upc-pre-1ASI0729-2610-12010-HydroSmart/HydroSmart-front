import { Entity } from '../../../shared/domain/base/entity.base';

export class Building extends Entity {
  constructor(
    id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly district: string,
    public readonly adminUserId: string,
    public readonly createdAt: Date
  ) {
    super(id);
  }

  displayName(): string {
    return `${this.name} — ${this.district}`;
  }
}
