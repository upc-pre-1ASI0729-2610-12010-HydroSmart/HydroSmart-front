import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from '../components/header/header.component';
import { AuthService } from '../../application/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, FormsModule],
  template: `
    <div class="app-layout">
      <app-sidebar />
      <div class="main-content">
        <app-header title="Perfil" subtitle="Gestiona tu información personal" />

        <div class="page-body">
          <div class="profile-grid">
            <!-- Photo Card -->
            <div class="card photo-card">
              <div class="avatar-large">{{ initials }}</div>
              <h2 class="profile-name">{{ form.name }} {{ form.lastName }}</h2>
              <span class="role-badge">{{ roleLabel }}</span>
              <p class="email-display">{{ form.email }}</p>
              <button class="btn-change-photo">
                <span class="material-icon">photo_camera</span>
                Cambiar foto
              </button>

              <div class="stats-mini">
                <div class="stat-item">
                  <span class="stat-val">3</span>
                  <span class="stat-lbl">Dispositivos</span>
                </div>
                <div class="stat-sep"></div>
                <div class="stat-item">
                  <span class="stat-val">8,000</span>
                  <span class="stat-lbl">Litros este mes</span>
                </div>
                <div class="stat-sep"></div>
                <div class="stat-item">
                  <span class="stat-val">-15%</span>
                  <span class="stat-lbl">vs. mes anterior</span>
                </div>
              </div>
            </div>

            <!-- Info Form Card -->
            <div class="card info-card">
              <div class="card-title-row">
                <h3>Información Personal</h3>
                @if (!editing()) {
                  <button class="btn-edit" (click)="startEdit()">
                    <span class="material-icon">edit</span> Editar
                  </button>
                }
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre</label>
                  <input [(ngModel)]="form.name" [disabled]="!editing()" name="name" />
                </div>
                <div class="form-group">
                  <label>Apellido</label>
                  <input [(ngModel)]="form.lastName" [disabled]="!editing()" name="lastName" />
                </div>
                <div class="form-group full">
                  <label>Correo electrónico</label>
                  <input [(ngModel)]="form.email" [disabled]="true" name="email" type="email" />
                </div>
                <div class="form-group">
                  <label>Teléfono</label>
                  <input [(ngModel)]="form.phone" [disabled]="!editing()" name="phone" />
                </div>
                <div class="form-group full">
                  <label>Dirección</label>
                  <input [(ngModel)]="form.street" [disabled]="!editing()" name="street" />
                </div>
                <div class="form-group">
                  <label>Distrito</label>
                  <input [(ngModel)]="form.district" [disabled]="!editing()" name="district" />
                </div>
                <div class="form-group">
                  <label>Ciudad</label>
                  <input [(ngModel)]="form.city" [disabled]="!editing()" name="city" />
                </div>
              </div>

              @if (editing()) {
                <div class="form-actions">
                  <button class="btn-cancel" (click)="cancelEdit()">Cancelar</button>
                  <button class="btn-save" (click)="saveChanges()">Guardar cambios</button>
                </div>
              }

              @if (saved()) {
                <div class="success-banner">
                  <span class="material-icon">check_circle</span>
                  Cambios guardados correctamente.
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; }
    .main-content { margin-left: 240px; flex: 1; background: var(--color-bg); }
    .page-body { padding: 24px 28px; }

    .profile-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
    }

    .card {
      background: var(--color-white);
      border-radius: var(--radius-lg);
      padding: 28px;
      box-shadow: var(--shadow-sm);
    }

    /* Photo card */
    .photo-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
    }
    .avatar-large {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: var(--color-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      color: white;
    }
    .profile-name { font-size: 18px; font-weight: 700; color: var(--color-primary); }
    .role-badge {
      background: rgba(74,183,135,0.12);
      color: var(--color-accent);
      padding: 3px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .email-display { font-size: 13px; color: var(--color-dark-grey); }
    .btn-change-photo {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      font-family: var(--font-family);
      color: var(--color-dark-grey);
      background: transparent;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-change-photo:hover { border-color: var(--color-accent); color: var(--color-accent); }
    .btn-change-photo .material-icon { font-family: 'Material Icons', sans-serif; font-style: normal; font-size: 18px; }

    .stats-mini {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      width: 100%;
    }
    .stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .stat-val { font-size: 16px; font-weight: 700; color: var(--color-primary); }
    .stat-lbl { font-size: 10px; color: var(--color-dark-grey); text-align: center; }
    .stat-sep { width: 1px; background: var(--color-border); }

    /* Info card */
    .card-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .card-title-row h3 { font-size: 16px; font-weight: 700; color: var(--color-primary); }

    .btn-edit {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      font-size: 13px;
      font-family: var(--font-family);
      color: var(--color-dark-grey);
      background: transparent;
      font-weight: 500;
      transition: all 0.15s;
    }
    .btn-edit:hover { border-color: var(--color-accent); color: var(--color-accent); }
    .btn-edit .material-icon { font-family: 'Material Icons', sans-serif; font-style: normal; font-size: 16px; }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full { grid-column: 1 / -1; }
    label { font-size: 12px; font-weight: 600; color: var(--color-primary); }
    input {
      padding: 10px 12px;
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      font-size: 14px;
      font-family: var(--font-family);
      color: var(--color-primary);
      background: var(--color-white);
      transition: border-color 0.15s;
    }
    input:focus { outline: none; border-color: var(--color-accent); }
    input:disabled { background: var(--color-bg); color: var(--color-dark-grey); cursor: not-allowed; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--color-border);
    }
    .btn-cancel {
      padding: 10px 20px;
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      font-size: 14px;
      font-family: var(--font-family);
      font-weight: 500;
      color: var(--color-dark-grey);
      background: transparent;
    }
    .btn-cancel:hover { border-color: var(--color-primary); color: var(--color-primary); }
    .btn-save {
      padding: 10px 24px;
      background: var(--color-accent);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-family: var(--font-family);
      font-weight: 600;
    }
    .btn-save:hover { background: #3da374; }

    .success-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #E8F7F1;
      color: var(--color-accent);
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      margin-top: 16px;
    }
    .success-banner .material-icon {
      font-family: 'Material Icons', sans-serif;
      font-style: normal;
      font-size: 20px;
    }

    .material-icon { font-family: 'Material Icons', sans-serif; font-style: normal; }
  `]
})
export class ProfileComponent {
  private authSvc = inject(AuthService);

  editing = signal(false);
  saved = signal(false);

  form = {
    name: this.authSvc.currentUser()?.name ?? '',
    lastName: this.authSvc.currentUser()?.lastName ?? '',
    email: this.authSvc.currentUser()?.email ?? '',
    phone: this.authSvc.currentUser()?.phone ?? '',
    street: this.authSvc.currentUser()?.address.street ?? '',
    district: this.authSvc.currentUser()?.address.district ?? '',
    city: this.authSvc.currentUser()?.address.city ?? ''
  };

  get initials(): string { return this.authSvc.currentUser()?.initials ?? 'U'; }
  get roleLabel(): string {
    return this.authSvc.currentUser()?.role === 'owner' ? 'Propietario' : 'Inquilino';
  }

  startEdit(): void {
    this.editing.set(true);
    this.saved.set(false);
  }

  cancelEdit(): void {
    const u = this.authSvc.currentUser();
    if (u) {
      this.form.name = u.name;
      this.form.lastName = u.lastName;
      this.form.phone = u.phone;
      this.form.street = u.address.street;
      this.form.district = u.address.district;
      this.form.city = u.address.city;
    }
    this.editing.set(false);
  }

  saveChanges(): void {
    this.authSvc.updateCurrentUser({
      name: this.form.name,
      lastName: this.form.lastName,
      phone: this.form.phone,
      address: {
        street: this.form.street,
        district: this.form.district,
        city: this.form.city,
        country: 'Perú'
      }
    });
    this.editing.set(false);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}
