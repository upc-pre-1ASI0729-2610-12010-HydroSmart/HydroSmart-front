import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../application/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="brand-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#031635"/>
              <path d="M24 8C24 8 12 20 12 28a12 12 0 0024 0c0-8-12-20-12-20z" fill="#4AB787"/>
              <path d="M24 18C24 18 18 24.5 18 28a6 6 0 0012 0c0-3.5-6-10-6-10z" fill="#23707D"/>
            </svg>
          </div>
          <h1 class="brand-name">HydroSmart</h1>
          <p class="brand-tagline">Gestión inteligente de consumo de agua</p>
        </div>

        <form class="login-form" (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="nombre@email.com"
              required
              autocomplete="email" />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-wrap">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                required
                autocomplete="current-password" />
              <button type="button" class="toggle-eye" (click)="showPassword.set(!showPassword())">
                <span class="material-icon">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          @if (errorMsg()) {
            <div class="error-banner">
              <span class="material-icon">error_outline</span>
              {{ errorMsg() }}
            </div>
          }

          <button type="submit" class="btn-login" [disabled]="loading()">
            @if (loading()) {
              <span>Iniciando sesión...</span>
            } @else {
              <span>Iniciar sesión</span>
            }
          </button>
        </form>

        <div class="demo-hints">
          <p class="demo-title">Cuentas de demostración:</p>
          <button class="demo-btn" (click)="fillDemo('owner')">
            Propietario — santiago.vela&#64;email.com
          </button>
          <button class="demo-btn" (click)="fillDemo('tenant')">
            Inquilino — arianna.flores&#64;email.com
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #031635 0%, #0a2850 50%, #0e3d6e 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .login-card {
      background: var(--color-white);
      border-radius: 16px;
      padding: 40px 36px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .brand-logo {
      margin-bottom: 12px;
    }

    .brand-name {
      font-size: 26px;
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: 4px;
    }

    .brand-tagline {
      font-size: 13px;
      color: var(--color-dark-grey);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-primary);
    }

    input {
      padding: 11px 14px;
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      font-size: 14px;
      color: var(--color-primary);
      background: var(--color-white);
      width: 100%;
      transition: border-color 0.15s;
    }
    input:focus {
      outline: none;
      border-color: var(--color-accent);
    }

    .input-wrap {
      position: relative;
    }
    .input-wrap input { padding-right: 44px; }
    .toggle-eye {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      color: var(--color-dark-grey);
      display: flex;
      align-items: center;
    }
    .toggle-eye .material-icon {
      font-size: 20px;
      font-family: 'Material Icons', sans-serif;
      font-style: normal;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: #FDECEA;
      color: var(--color-danger);
      border-radius: 8px;
      font-size: 13px;
    }
    .error-banner .material-icon {
      font-family: 'Material Icons', sans-serif;
      font-style: normal;
      font-size: 18px;
    }

    .btn-login {
      background: var(--color-accent);
      color: white;
      padding: 13px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      font-family: var(--font-family);
      width: 100%;
      transition: background 0.2s;
      margin-top: 4px;
    }
    .btn-login:hover:not(:disabled) { background: #3da374; }
    .btn-login:disabled { opacity: 0.65; cursor: not-allowed; }

    .demo-hints {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--color-border);
    }
    .demo-title {
      font-size: 12px;
      color: var(--color-light-grey);
      margin-bottom: 8px;
      text-align: center;
    }
    .demo-btn {
      display: block;
      width: 100%;
      text-align: left;
      background: var(--color-bg);
      color: var(--color-dark-grey);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-family: var(--font-family);
      margin-bottom: 6px;
      transition: background 0.15s;
    }
    .demo-btn:hover {
      background: #E8F7F1;
      color: var(--color-accent);
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = signal(false);
  loading = signal(false);
  errorMsg = signal('');

  fillDemo(role: 'owner' | 'tenant'): void {
    if (role === 'owner') {
      this.email = 'santiago.vela@email.com';
      this.password = 'owner123';
    } else {
      this.email = 'arianna.flores@email.com';
      this.password = 'tenant123';
    }
    this.errorMsg.set('');
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMsg.set('Por favor completa todos los campos.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    setTimeout(() => {
      const result = this.auth.login({ email: this.email, password: this.password });
      this.loading.set(false);

      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMsg.set(result.error ?? 'Error al iniciar sesión.');
      }
    }, 600);
  }
}
