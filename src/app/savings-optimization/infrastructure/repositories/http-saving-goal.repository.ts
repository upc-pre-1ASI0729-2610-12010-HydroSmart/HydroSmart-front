import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SavingGoalRepository } from '../../domain/repositories/saving-goal.repository';
import { SavingGoal, GoalStatus } from '../../domain/aggregates/saving-goal.aggregate';
import { SavingTarget } from '../../domain/value-objects/saving-target.vo';
import { MonthlyBudget } from '../../domain/value-objects/monthly-budget.vo';
import { ConsumptionLimit } from '../../domain/value-objects/consumption-limit.vo';
import { WaterVolume } from '../../../shared/domain/value-objects/water-volume.vo';
import { TimestampRange } from '../../../shared/domain/value-objects/timestamp-range.vo';
import { ApiResponse } from '../../../shared/infrastructure/http/api-response.model';
import { environment } from '../../../../environments/environment';

interface SavingGoalDTO {
  id: number;
  name: string;
  targetVolumeLiters: number;
  currentVolumeLiters: number;
  monthlyBudget: number;
  status: string;
  progressPercent: number;
  isAchieved: boolean;
  recommendations: string[];
  startDate: string;
  endDate: string;
}

@Injectable()
export class HttpSavingGoalRepository extends SavingGoalRepository {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private _active = signal<SavingGoal | null>(null);

  async preload(buildingId: string): Promise<void> {
    try {
      const numId = this.numericId(buildingId);
      const res = await firstValueFrom(
        this.http.get<ApiResponse<SavingGoalDTO>>(
          `${this.api}/saving-goals/active?buildingId=${numId}`
        )
      );
      if (res.success && res.data) {
        this._active.set(this.mapToGoal(res.data));
      }
    } catch (err) { console.error('Error loading saving goal:', err); }
  }

  findActiveByUserId(_userId: string): SavingGoal | null {
    return this._active();
  }

  findAllByUserId(_userId: string): SavingGoal[] {
    const g = this._active();
    return g ? [g] : [];
  }

  save(goal: SavingGoal): void {
    this._active.set(goal);
  }

  private mapToGoal(dto: SavingGoalDTO): SavingGoal {
    return new SavingGoal(
      String(dto.id),
      'building',
      dto.name,
      SavingTarget.monthly(dto.targetVolumeLiters),
      MonthlyBudget.of(dto.monthlyBudget ?? 40, 'PEN'),
      ConsumptionLimit.monthly(dto.targetVolumeLiters * 1.2),
      TimestampRange.of(new Date(dto.startDate), new Date(dto.endDate)),
      WaterVolume.ofLiters(dto.currentVolumeLiters),
      dto.status as GoalStatus,
      dto.recommendations ?? []
    );
  }

  private numericId(id: string): number {
    const match = id.match(/\d+$/);
    return match ? parseInt(match[0], 10) : parseInt(id, 10) || 1;
  }
}
