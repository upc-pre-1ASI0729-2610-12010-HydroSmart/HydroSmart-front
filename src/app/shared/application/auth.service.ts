import { Injectable, signal } from '@angular/core';
import { UserAccount, UserCredentials, UserSession, UserRole } from '../domain/user.model';
import usersData from '../infrastructure/mock-data/users.json';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_KEY = 'hydrosmart_session';

  currentUser = signal<UserAccount | null>(this.loadSessionUser());

  login(credentials: UserCredentials): { success: boolean; error?: string } {
    const raw = (usersData as any[]).find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    if (!raw) return { success: false, error: 'Correo o contraseña incorrectos.' };

    const user = this.mapToUserAccount(raw);
    const session: UserSession = {
      userId: user.id,
      token: `mock-token-${Date.now()}`,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      role: user.role
    };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({ user: raw, session }));
    this.currentUser.set(user);
    return { success: true };
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean { return this.currentUser() !== null; }

  updateCurrentUser(updated: Partial<UserAccount>): void {
    const user = this.currentUser();
    if (!user) return;
    const stored = JSON.parse(sessionStorage.getItem(this.SESSION_KEY) || '{}');
    const merged = { ...stored.user, ...updated };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({ ...stored, user: merged }));
    this.currentUser.set(this.mapToUserAccount(merged));
  }

  private loadSessionUser(): UserAccount | null {
    try {
      const raw = sessionStorage.getItem(this.SESSION_KEY);
      if (!raw) return null;
      const { user } = JSON.parse(raw);
      return this.mapToUserAccount(user);
    } catch { return null; }
  }

  private mapToUserAccount(raw: any): UserAccount {
    return new UserAccount(
      raw.id, raw.name, raw.lastName, raw.email,
      raw.phone, raw.role as UserRole, raw.address,
      raw.avatarUrl ?? '', new Date(raw.createdAt), raw.isActive
    );
  }
}
