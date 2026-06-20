import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../../shared/infrastructure/http/api-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PropertyHttpService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  assignTenant(unitId: string, data: {
    name: string; lastName: string; email: string; phone: string; password: string;
  }) {
    const numId = this.numericId(unitId);
    return firstValueFrom(
      this.http.post<ApiResponse<any>>(
        `${this.api}/units/${numId}/assign-tenant`, data
      )
    );
  }

  removeTenant(unitId: string) {
    const numId = this.numericId(unitId);
    return firstValueFrom(
      this.http.delete<ApiResponse<any>>(
        `${this.api}/units/${numId}/tenant`
      )
    );
  }

  createSensor(data: { name: string; type: string; location: string; unitId: string }) {
    return firstValueFrom(
      this.http.post<ApiResponse<any>>(`${this.api}/sensors`, {
        ...data,
        unitId: this.numericId(data.unitId)
      })
    );
  }

  getTenantDetail(unitId: string) {
    const numId = this.numericId(unitId);
    return firstValueFrom(
      this.http.get<ApiResponse<any>>(`${this.api}/units/${numId}/tenant`)
    );
  }

  private numericId(id: string): number {
    const match = id.match(/\d+$/);
    return match ? parseInt(match[0], 10) : parseInt(id, 10) || 1;
  }
}
