import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserAccount, UserRole, Address } from '../domain/user.model';
import { ApiResponse } from '../infrastructure/http/api-response.model';
import { environment } from '../../../environments/environment';

interface AddressDTO {
  street: string;
  city: string;
  district: string;
  country: string;
}

interface UserDTO {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  address?: AddressDTO;
  createdAt: string;
  isActive: boolean;
}

interface LoginResponseDTO {
  token: string;
  user: UserDTO;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'hydrosmart_token';
  private readonly USER_KEY = 'hydrosmart_user';

  currentUser = signal<UserAccount | null>(this.loadStoredUser());

  async login(credentials: { email: string; password: string }): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<LoginResponseDTO>>(
          `${environment.apiUrl}/auth/login`,
          credentials
        )
      );

      if (!res.success || !res.data) {
        return { success: false, error: res.message || 'Credenciales inválidas.' };
      }

      const { token, user } = res.data;
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.currentUser.set(this.mapToUserAccount(user));
      return { success: true };

    } catch (err: any) {
      const msg = err?.error?.message ?? 'Error al conectar con el servidor.';
      return { success: false, error: msg };
    }
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean { return this.currentUser() !== null; }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  updateCurrentUser(updated: Partial<UserAccount>): void {
    const user = this.currentUser();
    if (!user) return;
    const stored = JSON.parse(sessionStorage.getItem(this.USER_KEY) || '{}');
    const merged = { ...stored, ...updated };
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(merged));
    this.currentUser.set(this.mapToUserAccount(merged));
  }

  private loadStoredUser(): UserAccount | null {
    try {
      const raw = sessionStorage.getItem(this.USER_KEY);
      if (!raw) return null;
      return this.mapToUserAccount(JSON.parse(raw));
    } catch { return null; }
  }

  private mapToUserAccount(raw: any): UserAccount {
    const role: UserRole = raw.role === 'BUILDING_ADMIN' ? 'BUILDING_ADMIN' : 'TENANT';
    const address: Address = raw.address ?? { street: '', city: '', district: '', country: '' };
    const createdAt = raw.createdAt ? new Date(raw.createdAt) : new Date();
    return new UserAccount(
      String(raw.id),
      raw.name,
      raw.lastName,
      raw.email,
      raw.phone ?? '',
      role,
      address,
      raw.avatarUrl ?? '',
      createdAt,
      raw.isActive ?? true
    );
  }
}
