import { TenantConsumption } from '../aggregates/tenant-consumption.aggregate';

export abstract class PropertyManagementRepository {
  abstract findByAdminUserId(adminUserId: string): TenantConsumption[];
  abstract findById(id: string): TenantConsumption | null;
  abstract save(tc: TenantConsumption): void;
}
