import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LowerCasePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/presentation/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/presentation/components/header/header.component';
import { TranslationService } from '../../../shared/application/i18n/translation.service';
import { BuildingContextService, UnitDisplay, NewTenantForm } from '../../../shared/application/building-context.service';
import { PropertyHttpService } from '../../infrastructure/http/property-http.service';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, LowerCasePipe, DecimalPipe, FormsModule],
  template: `
    <div class="app-layout">
      <app-sidebar />
      <div class="main-content">
        <app-header [title]="i18n.t('units.title')" [subtitle]="i18n.t('units.subtitle')" />

        <div class="page-body">
          <div class="card">
            <div class="table-header">
              <h3>{{ i18n.t('units.title') }}</h3>
              <div class="table-actions">
                <span class="total-badge">{{ units.length }} {{ i18n.t('units.title') | lowercase }}</span>
              </div>
            </div>

            <table class="devices-table">
              <thead>
                <tr>
                  <th>{{ i18n.t('units.unit') }}</th>
                  <th>{{ i18n.t('units.floor') }}</th>
                  <th>{{ i18n.t('units.tenant') }}</th>
                  <th>{{ i18n.t('units.consumption') }}</th>
                  <th>{{ i18n.t('units.limit') }}</th>
                  <th>{{ i18n.t('units.status') }}</th>
                  <th>{{ i18n.t('units.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (unit of units; track unit.id) {
                  <tr [class.row-warning]="isOverLimit(unit)">
                    <td>
                      <div class="device-name-cell">
                        <div class="device-icon-sm">
                          <span class="material-icon">apartment</span>
                        </div>
                        <div class="device-name">{{ unit.unitNumber }}</div>
                      </div>
                    </td>
                    <td class="cell-muted">{{ unit.floor }}</td>
                    <td>
                      @if (unit.tenantName) {
                        <button class="tenant-link" (click)="openTenantDrawer(unit)">{{ unit.tenantName }}</button>
                      } @else {
                        <span class="unassigned">{{ i18n.t('units.unassigned') }}</span>
                      }
                    </td>
                    <td class="cell-flow">{{ unit.currentConsumptionLiters | number }} L</td>
                    <td class="cell-muted">{{ unit.monthlyLimitLiters | number }} L</td>
                    <td>
                      @if (unit.tenantUserId) {
                        <span class="status-pill" [class]="isOverLimit(unit) ? 'st-warning' : 'st-active'">
                          <span class="status-dot"></span>
                          {{ isOverLimit(unit) ? i18n.t('units.overLimit') : i18n.t('units.withinLimit') }}
                        </span>
                      } @else {
                        <span class="status-pill st-inactive">
                          <span class="status-dot"></span>
                          {{ i18n.t('units.vacant') }}
                        </span>
                      }
                    </td>
                    <td>
                      <div class="row-actions">
                        <button class="action-btn" (click)="viewSensors(unit)" [title]="i18n.t('units.viewSensors')">
                          <span class="material-icon">sensors</span>
                        </button>
                        @if (!unit.tenantUserId) {
                          <button class="action-btn accent-btn" (click)="openAssignModal(unit)" [title]="i18n.t('units.assignTenant')">
                            <span class="material-icon">person_add</span>
                          </button>
                        } @else {
                          <button class="action-btn" (click)="openTenantDrawer(unit)" [title]="i18n.t('units.viewTenant')">
                            <span class="material-icon">person</span>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            <div class="summary-row">
              <div class="summary-item">
                <span class="summary-label">{{ i18n.t('units.totalConsumption') }}</span>
                <span class="summary-value">{{ totalConsumption | number }} L</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">{{ i18n.t('units.unitsOverLimit') }}</span>
                <span class="summary-value danger">{{ unitsOverLimit }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">{{ i18n.t('units.projectedCost') }}</span>
                <span class="summary-value">S/. {{ projectedCost | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Tenant Modal (Pedido 1) -->
    @if (showAssignModal()) {
      <div class="modal-overlay" (click)="closeAssignModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>{{ i18n.t('units.assignModal.title') }}</h3>
              <span class="modal-sub">{{ i18n.t('units.unit') }} {{ assignTargetUnit()?.unitNumber }}</span>
            </div>
            <button class="close-btn" (click)="closeAssignModal()">
              <span class="material-icon">close</span>
            </button>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>{{ i18n.t('profile.name') }}</label>
              <input type="text" [(ngModel)]="assignForm.name" placeholder="Nombre" />
            </div>
            <div class="form-field">
              <label>{{ i18n.t('profile.lastName') }}</label>
              <input type="text" [(ngModel)]="assignForm.lastName" placeholder="Apellido" />
            </div>
            <div class="form-field">
              <label>{{ i18n.t('profile.email') }}</label>
              <input type="email" [(ngModel)]="assignForm.email" placeholder="correo@email.com" />
            </div>
            <div class="form-field">
              <label>{{ i18n.t('profile.phone') }}</label>
              <input type="text" [(ngModel)]="assignForm.phone" placeholder="+51 9XX XXX XXX" />
            </div>
            <div class="form-field full-width">
              <label>{{ i18n.t('login.password') }}</label>
              <input type="password" [(ngModel)]="assignForm.password" placeholder="••••••••" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeAssignModal()">{{ i18n.t('units.assignModal.cancel') }}</button>
            <button class="btn-save" (click)="saveAssign()" [disabled]="!assignForm.name || !assignForm.email">
              {{ i18n.t('units.assignModal.save') }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Tenant Drawer (Pedido 3) -->
    @if (drawerOpen()) {
      <div class="drawer-overlay" (click)="closeDrawer()"></div>
      <div class="drawer open">
        <div class="drawer-header">
          <div class="drawer-avatar">{{ drawerInitials() }}</div>
          <div class="drawer-user-info">
            <span class="drawer-name">{{ drawerUnit()?.tenantName }}</span>
            <span class="drawer-email">{{ drawerTenantUser()?.email }}</span>
          </div>
          <button class="close-btn" (click)="closeDrawer()">
            <span class="material-icon">close</span>
          </button>
        </div>

        <div class="drawer-body">
          <div class="drawer-section">
            <h4>{{ i18n.t('units.drawer.contact') }}</h4>
            <div class="drawer-row">
              <span class="material-icon">phone</span>
              <span>{{ drawerTenantUser()?.phone || '—' }}</span>
            </div>
            <div class="drawer-row">
              <span class="material-icon">email</span>
              <span>{{ drawerTenantUser()?.email }}</span>
            </div>
          </div>

          <div class="drawer-section">
            <h4>{{ i18n.t('units.drawer.unit') }}</h4>
            <div class="drawer-row">
              <span class="material-icon">apartment</span>
              <span>{{ i18n.t('units.unit') }} {{ drawerUnit()?.unitNumber }} — Piso {{ drawerUnit()?.floor }}</span>
            </div>
            <div class="drawer-row">
              <span class="material-icon">calendar_today</span>
              <span>{{ formatDate(drawerTenantUser()?.createdAt) }}</span>
            </div>
          </div>

          <div class="drawer-section">
            <h4>{{ i18n.t('units.drawer.consumption') }}</h4>
            <div class="consumption-bar-wrap">
              <div class="consumption-labels">
                <span>{{ drawerUnit()?.currentConsumptionLiters | number }} L</span>
                <span>{{ drawerUnit()?.monthlyLimitLiters | number }} L</span>
              </div>
              <div class="consumption-bar">
                <div class="consumption-fill"
                  [style.width.%]="consumptionPercent()"
                  [class.over]="isOverLimit(drawerUnit()!)">
                </div>
              </div>
              <div class="consumption-text">
                {{ drawerUnit()?.currentConsumptionLiters | number }} L
                de {{ drawerUnit()?.monthlyLimitLiters | number }} L
                ({{ consumptionPercent() }}%)
              </div>
            </div>
          </div>
        </div>

        <div class="drawer-footer">
          <button class="btn-unassign" (click)="unassignTenant()">
            <span class="material-icon">person_remove</span>
            {{ i18n.t('units.drawer.unassign') }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; }
    .main-content { margin-left: 240px; flex: 1; background: var(--color-bg); }
    .page-body { padding: 24px 28px; }

    .card { background: var(--color-white); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); }

    .table-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .table-header h3 { font-size: 16px; font-weight: 700; color: var(--color-primary); }
    .table-actions { display: flex; align-items: center; gap: 10px; }
    .total-badge { font-size: 12px; color: var(--color-dark-grey); background: var(--color-bg); padding: 4px 12px; border-radius: 20px; }

    .devices-table { width: 100%; border-collapse: collapse; }
    .devices-table th { text-align: left; padding: 10px 16px; font-size: 12px; font-weight: 600; color: var(--color-dark-grey); border-bottom: 1px solid var(--color-border); white-space: nowrap; }
    .devices-table td { padding: 14px 16px; border-bottom: 1px solid var(--color-border); font-size: 13px; color: var(--color-primary); vertical-align: middle; }
    .devices-table tr:last-child td { border-bottom: none; }
    .devices-table tr.row-warning { background: #FFFBF0; }

    .device-name-cell { display: flex; align-items: center; gap: 12px; }
    .device-icon-sm { width: 36px; height: 36px; border-radius: 8px; background: var(--color-bg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .material-icon { font-family: 'Material Icons', sans-serif; font-style: normal; font-size: 20px; }
    .device-name { font-weight: 600; font-size: 13px; }

    .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .st-active { background: #E8F7F1; color: var(--color-accent); }
    .st-warning { background: #FEF6E8; color: var(--color-warning); }
    .st-inactive { background: var(--color-bg); color: var(--color-dark-grey); }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }

    .cell-muted { color: var(--color-dark-grey); }
    .cell-flow { color: var(--color-teal); font-weight: 500; }
    .unassigned { font-size: 12px; color: var(--color-light-grey); font-style: italic; }

    .tenant-link {
      background: none; border: none; padding: 0;
      color: var(--color-accent); font-size: 13px; font-weight: 600;
      cursor: pointer; text-decoration: underline; font-family: var(--font-family);
    }
    .tenant-link:hover { color: #3da374; }

    .row-actions { display: flex; gap: 6px; }
    .action-btn { width: 32px; height: 32px; border-radius: 6px; background: var(--color-bg); color: var(--color-dark-grey); display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .action-btn:hover { background: #EBF3FD; color: #2980B9; }
    .action-btn.accent-btn:hover { background: #E8F7F1; color: var(--color-accent); }

    .summary-row { display: flex; gap: 32px; padding: 16px 16px 0; border-top: 1px solid var(--color-border); margin-top: 8px; }
    .summary-item { display: flex; flex-direction: column; gap: 2px; }
    .summary-label { font-size: 11px; font-weight: 600; color: var(--color-dark-grey); text-transform: uppercase; letter-spacing: 0.4px; }
    .summary-value { font-size: 18px; font-weight: 700; color: var(--color-primary); }
    .summary-value.danger { color: var(--color-danger); }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(3,22,53,0.5); z-index: 300; display: flex; align-items: center; justify-content: center; }
    .modal-card { background: var(--color-white); border-radius: 16px; padding: 28px; width: 520px; max-width: 90vw; box-shadow: var(--shadow-lg); }
    .modal-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .modal-header h3 { font-size: 16px; font-weight: 700; color: var(--color-primary); }
    .modal-sub { font-size: 13px; color: var(--color-dark-grey); }
    .close-btn { width: 32px; height: 32px; background: var(--color-bg); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--color-dark-grey); }
    .close-btn:hover { color: var(--color-danger); background: #FDECEA; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-field { display: flex; flex-direction: column; gap: 6px; }
    .form-field.full-width { grid-column: 1 / -1; }
    .form-field label { font-size: 12px; font-weight: 600; color: var(--color-primary); }
    .form-field input {
      padding: 10px 12px; border: 1.5px solid var(--color-border); border-radius: 8px;
      font-size: 13px; font-family: var(--font-family); color: var(--color-primary); background: var(--color-white);
    }
    .form-field input:focus { outline: none; border-color: var(--color-accent); }

    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--color-border); }
    .btn-cancel { padding: 10px 20px; border: 1.5px solid var(--color-border); border-radius: 8px; font-size: 14px; font-family: var(--font-family); color: var(--color-dark-grey); background: transparent; }
    .btn-save { padding: 10px 24px; background: var(--color-accent); color: white; border-radius: 8px; font-size: 14px; font-family: var(--font-family); font-weight: 600; }
    .btn-save:hover:not(:disabled) { background: #3da374; }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Drawer */
    .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100; }
    .drawer {
      position: fixed; top: 0; right: 0; bottom: 0;
      width: 360px; background: var(--color-white);
      box-shadow: -4px 0 24px rgba(0,0,0,0.12);
      z-index: 101; transform: translateX(100%);
      transition: transform 0.25s ease; overflow-y: auto;
      display: flex; flex-direction: column;
    }
    .drawer.open { transform: translateX(0); }

    .drawer-header {
      display: flex; align-items: center; gap: 12px;
      padding: 24px 20px; border-bottom: 1px solid var(--color-border);
    }
    .drawer-avatar {
      width: 48px; height: 48px; border-radius: 50%;
      background: var(--color-accent); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700; flex-shrink: 0;
    }
    .drawer-user-info { flex: 1; min-width: 0; }
    .drawer-name { display: block; font-size: 15px; font-weight: 700; color: var(--color-primary); }
    .drawer-email { display: block; font-size: 12px; color: var(--color-dark-grey); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .drawer-body { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 24px; }

    .drawer-section h4 {
      font-size: 11px; font-weight: 700; color: var(--color-dark-grey);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;
    }
    .drawer-row { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--color-primary); margin-bottom: 8px; }
    .drawer-row .material-icon { font-size: 18px; color: var(--color-dark-grey); }

    .consumption-bar-wrap { display: flex; flex-direction: column; gap: 6px; }
    .consumption-labels { display: flex; justify-content: space-between; font-size: 12px; color: var(--color-dark-grey); }
    .consumption-bar { height: 8px; background: var(--color-border); border-radius: 4px; overflow: hidden; }
    .consumption-fill { height: 100%; background: var(--color-accent); border-radius: 4px; transition: width 0.3s ease; }
    .consumption-fill.over { background: var(--color-warning); }
    .consumption-text { font-size: 12px; color: var(--color-dark-grey); }

    .drawer-footer { padding: 16px 20px; border-top: 1px solid var(--color-border); }
    .btn-unassign {
      display: flex; align-items: center; gap: 8px;
      width: 100%; padding: 10px 16px;
      background: #FDECEA; color: var(--color-danger);
      border-radius: 8px; font-size: 13px; font-family: var(--font-family); font-weight: 600;
      transition: background 0.15s;
    }
    .btn-unassign:hover { background: #F9C9C5; }
    .btn-unassign .material-icon { font-size: 18px; }
  `]
})
export class UnitsComponent {
  i18n = inject(TranslationService);
  private buildingCtx = inject(BuildingContextService);
  private propertyHttp = inject(PropertyHttpService);
  private router = inject(Router);

  // Assign modal
  showAssignModal = signal(false);
  assignTargetUnit = signal<UnitDisplay | null>(null);
  assignForm: NewTenantForm = { name: '', lastName: '', email: '', phone: '', password: '' };

  // Drawer
  drawerOpen = signal(false);
  drawerUnit = signal<UnitDisplay | null>(null);

  get units(): UnitDisplay[] {
    return this.buildingCtx.units;
  }

  isOverLimit(unit: UnitDisplay): boolean {
    return unit.tenantUserId !== null && unit.currentConsumptionLiters > unit.monthlyLimitLiters;
  }

  get totalConsumption(): number {
    return this.units.reduce((sum, u) => sum + u.currentConsumptionLiters, 0);
  }

  get unitsOverLimit(): number {
    return this.units.filter(u => this.isOverLimit(u)).length;
  }

  get projectedCost(): number {
    return this.units.reduce((sum, u) => {
      const cost = u.currentConsumptionLiters * 0.005;
      const penalty = this.isOverLimit(u)
        ? (u.currentConsumptionLiters - u.monthlyLimitLiters) * u.penaltyPerExcessLiter
        : 0;
      return sum + cost + penalty;
    }, 0);
  }

  viewSensors(unit: UnitDisplay): void {
    this.router.navigate(['/devices'], { queryParams: { unitId: unit.id } });
  }

  // Assign tenant modal
  openAssignModal(unit: UnitDisplay): void {
    this.assignTargetUnit.set(unit);
    this.assignForm = { name: '', lastName: '', email: '', phone: '', password: '' };
    this.showAssignModal.set(true);
  }

  closeAssignModal(): void {
    this.showAssignModal.set(false);
    this.assignTargetUnit.set(null);
  }

  async saveAssign(): Promise<void> {
    const unit = this.assignTargetUnit();
    if (!unit) return;
    try {
      await this.propertyHttp.assignTenant(unit.id, this.assignForm);
      await this.buildingCtx.refreshUnits();
    } catch (err) {
      console.error('assignTenant failed:', err);
      this.buildingCtx.assignTenant(unit.id, this.assignForm);
    }
    this.closeAssignModal();
  }

  // Tenant drawer
  openTenantDrawer(unit: UnitDisplay): void {
    this.drawerUnit.set(unit);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerUnit.set(null);
  }

  drawerTenantUser(): any | null {
    const unit = this.drawerUnit();
    if (!unit?.tenantUserId) return null;
    return this.buildingCtx.getUserById(unit.tenantUserId);
  }

  drawerInitials(): string {
    const name = this.drawerUnit()?.tenantName ?? '';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  consumptionPercent(): number {
    const unit = this.drawerUnit();
    if (!unit || unit.monthlyLimitLiters === 0) return 0;
    return Math.min(100, Math.round((unit.currentConsumptionLiters / unit.monthlyLimitLiters) * 100));
  }

  async unassignTenant(): Promise<void> {
    const unit = this.drawerUnit();
    if (!unit) return;
    try {
      await this.propertyHttp.removeTenant(unit.id);
      await this.buildingCtx.refreshUnits();
    } catch (err) {
      console.error('removeTenant failed:', err);
      this.buildingCtx.unassignTenant(unit.id);
    }
    this.closeDrawer();
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateStr));
  }
}
