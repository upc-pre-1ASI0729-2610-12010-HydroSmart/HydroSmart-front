/**
 * Rental Management — Rental Repository (abstract)
 *
 * Pertenece a: rental-management/domain/repositories
 */
import { TenantConsumption } from '../aggregates/tenant-consumption.aggregate';

export abstract class RentalRepository {
  abstract findByOwnerId(ownerId: string): TenantConsumption[];
  abstract findById(id: string): TenantConsumption | null;
  abstract save(tc: TenantConsumption): void;
}
