import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface IrrigationRecommendation {
  shouldIrrigate: boolean;
  recommendation: string;
  rainMmNext24h: number;
  temperatureC: number;
  weatherCondition: string;
  latitude: number;
  longitude: number;
}

/**
 * Servicio del bounded context Smart Irrigation.
 * Consume el endpoint del backend que integra el servicio externo OpenWeather
 * para ofrecer recomendaciones de riego basadas en el clima.
 */
@Injectable({ providedIn: 'root' })
export class IrrigationService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  private _recommendation = signal<IrrigationRecommendation | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly recommendation = this._recommendation.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async loadRecommendation(latitude?: number, longitude?: number): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      let url = `${this.api}/weather/recommendation`;
      const params: string[] = [];
      if (latitude != null) params.push(`latitude=${latitude}`);
      if (longitude != null) params.push(`longitude=${longitude}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await firstValueFrom(
        this.http.get<{ success: boolean; data: IrrigationRecommendation }>(url)
      );
      this._recommendation.set(res.data);
    } catch (e: any) {
      this._error.set('No se pudo obtener la recomendación de riego');
      console.error('[IrrigationService] error', e);
    } finally {
      this._loading.set(false);
    }
  }
}
