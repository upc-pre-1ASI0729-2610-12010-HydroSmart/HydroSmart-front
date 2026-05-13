import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../application/auth.service';
import { Router } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 3C14 3 6 11 6 17a8 8 0 0016 0c0-6-8-14-8-14z" fill="#4AB787"/>
            <path d="M14 10C14 10 10 14.5 10 17a4 4 0 008 0c0-2.5-4-7-4-7z" fill="#23707D"/>
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-name">HydroSmart</span>
          <span class="logo-tagline">Gestión de Agua</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul>
          @for (item of navItems; track item.route) {
            <li>
              <a
                [routerLink]="item.route"
                routerLinkActive="active"
                class="nav-link">
                <span class="nav-icon material-icon">{{ item.icon }}</span>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            </li>
          }
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">{{ initials }}</div>
          <div class="user-details">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
        </div>
        <button class="logout-btn" (click)="logout()" title="Cerrar sesión">
          <span class="material-icon">logout</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      min-height: 100vh;
      background: var(--color-primary);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 100;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 20px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: rgba(74, 183, 135, 0.15);
      border-radius: 10px;
      flex-shrink: 0;
    }

    .logo-text { display: flex; flex-direction: column; }
    .logo-name {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-white);
      line-height: 1.2;
    }
    .logo-tagline {
      font-size: 10px;
      color: rgba(255,255,255,0.45);
      font-weight: 400;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      overflow-y: auto;
    }

    .sidebar-nav ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      color: rgba(255,255,255,0.6);
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    .nav-link:hover {
      background: rgba(255,255,255,0.07);
      color: rgba(255,255,255,0.9);
    }
    .nav-link.active {
      background: rgba(74,183,135,0.18);
      color: var(--color-accent);
    }
    .nav-link.active .nav-icon { color: var(--color-accent); }

    .nav-icon {
      font-size: 20px;
      width: 20px;
      flex-shrink: 0;
      font-family: 'Material Icons', sans-serif;
      font-style: normal;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }

    .avatar {
      width: 34px;
      height: 34px;
      background: var(--color-accent);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-white);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-role {
      font-size: 11px;
      color: rgba(255,255,255,0.45);
      text-transform: capitalize;
    }

    .logout-btn {
      background: transparent;
      color: rgba(255,255,255,0.4);
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      flex-shrink: 0;
    }
    .logout-btn:hover {
      background: rgba(231,76,60,0.15);
      color: #e74c3c;
    }
    .logout-btn .material-icon {
      font-size: 18px;
      font-family: 'Material Icons', sans-serif;
      font-style: normal;
    }

    .material-icon {
      font-family: 'Material Icons', sans-serif;
      font-style: normal;
      font-size: 20px;
    }
  `]
})
export class SidebarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Perfil', route: '/profile', icon: 'person' },
    { label: 'Dispositivos', route: '/devices', icon: 'sensors' },
    { label: 'Reportes', route: '/reports', icon: 'bar_chart' },
    { label: 'Configuración', route: '/settings', icon: 'settings' },
  ];

  get userName(): string {
    return this.auth.currentUser()?.fullName ?? '';
  }

  get initials(): string {
    return this.auth.currentUser()?.initials ?? 'U';
  }

  get userRole(): string {
    const role = this.auth.currentUser()?.role;
    return role === 'owner' ? 'Propietario' : 'Inquilino';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
