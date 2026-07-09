import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../infrastructure/http/api-response.model';
import { environment } from '../../../environments/environment';

export interface UnitDisplay {
  id: string;
  buildingId: string;
  unitNumber: string;
  floor: number;
  monthlyLimitLiters: number;
  penaltyPerExcessLiter: number;
  tenantUserId: string | null;
  currentConsumptionLiters: number;
  tenantName: string;
}

export interface NewTenantForm {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

// DTO del backend
interface UnitDTO {
  id: number;
  buildingId: number;
  unitNumber: string;
  floor: number;
  monthlyLimitLiters: number;
  penaltyPerExcessLiter: number;
  tenantUserId: number | null;
  currentConsumptionLiters: number;
  tenantName: string;
}

@Injectable({ providedIn: 'root' })
export class BuildingContextService {
  private http = inject(HttpClient);

  readonly currentBuildingId: WritableSignal<string | null> = signal('1');
  readonly selectedUnitId: WritableSignal<string | null> = signal(null);

  private _unitsSignal: WritableSignal<UnitDisplay[]> = signal([]);
  private _users: any[] = [];

  get units(): UnitDisplay[] {
    return this._unitsSignal();
  }

  async loadUnits(buildingId: string): Promise<void> {
    try {
      const numericId = this.numericId(buildingId);
      const res = await firstValueFrom(
        this.http.get<ApiResponse<UnitDTO[]>>(
          `${environment.apiUrl}/units?buildingId=${numericId}`
        )
      );
      if (res.success && res.data) {
        this._unitsSignal.set(res.data.map(u => ({
          id: String(u.id),
          buildingId: String(u.buildingId),
          unitNumber: u.unitNumber,
          floor: u.floor,
          monthlyLimitLiters: u.monthlyLimitLiters ?? 8000,
          penaltyPerExcessLiter: u.penaltyPerExcessLiter ?? 0.008,
          tenantUserId: u.tenantUserId != null ? String(u.tenantUserId) : null,
          currentConsumptionLiters: u.currentConsumptionLiters ?? 0,
          tenantName: u.tenantName ?? ''
        })));
      }
    } catch (err) {
      console.error('Error loading units:', err);
    }
  }

  async refreshUnits(): Promise<void> {
    const bid = this.currentBuildingId();
    if (bid) await this.loadUnits(bid);
  }

  /** Endpoint tenant-safe: obtiene la unidad del usuario autenticado (GET /units/me). */
  async loadMyUnit(): Promise<UnitDisplay | null> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<UnitDTO>>(`${environment.apiUrl}/units/me`)
      );
      if (res.success && res.data) {
        const u: UnitDisplay = {
          id: String(res.data.id),
          buildingId: String(res.data.buildingId),
          unitNumber: res.data.unitNumber,
          floor: res.data.floor,
          monthlyLimitLiters: res.data.monthlyLimitLiters ?? 8000,
          penaltyPerExcessLiter: res.data.penaltyPerExcessLiter ?? 0.008,
          tenantUserId: res.data.tenantUserId != null ? String(res.data.tenantUserId) : null,
          currentConsumptionLiters: res.data.currentConsumptionLiters ?? 0,
          tenantName: res.data.tenantName ?? ''
        };
        const current = this._unitsSignal().filter(x => x.id !== u.id);
        this._unitsSignal.set([...current, u]);
        return u;
      }
    } catch (err) {
      console.error('Error loading my unit:', err);
    }
    return null;
  }

  getUnitForTenant(tenantUserId: string): UnitDisplay | null {
    return this._unitsSignal().find(u => u.tenantUserId === tenantUserId) ?? null;
  }

  getUserById(userId: string): any | null {
    return this._users.find(u => u.id === userId) ?? null;
  }

  getUsers(): any[] {
    return this._users;
  }

  selectUnit(unitId: string | null): void {
    // Normalizar string vacío → null para que los effects del header funcionen
    this.selectedUnitId.set(unitId && unitId !== '' ? unitId : null);
  }

  // Mantiene la firma legacy; el llamador debe luego invocar refreshUnits()
  // para sincronizar con el backend.
  assignTenant(unitId: string, form: NewTenantForm): void {
    const current = this._unitsSignal();
    const idx = current.findIndex(u => u.id === unitId);
    if (idx >= 0) {
      const updated = [...current];
      updated[idx] = {
        ...updated[idx],
        tenantName: `${form.name} ${form.lastName}`
      };
      this._unitsSignal.set(updated);
    }
  }

  unassignTenant(unitId: string): void {
    const current = this._unitsSignal();
    const idx = current.findIndex(u => u.id === unitId);
    if (idx >= 0) {
      const updated = [...current];
      updated[idx] = { ...updated[idx], tenantUserId: null, tenantName: '' };
      this._unitsSignal.set(updated);
    }
  }

  private numericId(id: string): number {
    const match = id.match(/\d+$/);
    return match ? parseInt(match[0], 10) : parseInt(id, 10) || 1;
  }
}
