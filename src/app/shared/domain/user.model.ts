export type UserRole = 'owner' | 'tenant';

export interface Address {
  street: string;
  city: string;
  district: string;
  country: string;
}

export class UserAccount {
  constructor(
    public readonly id: string,
    public name: string,
    public lastName: string,
    public email: string,
    public phone: string,
    public role: UserRole,
    public address: Address,
    public avatarUrl: string,
    public createdAt: Date,
    public isActive: boolean
  ) {}

  get fullName(): string { return `${this.name} ${this.lastName}`; }
  get initials(): string { return `${this.name[0]}${this.lastName[0]}`.toUpperCase(); }
  isOwner(): boolean { return this.role === 'owner'; }
  isTenant(): boolean { return this.role === 'tenant'; }
  canManageDevices(): boolean { return this.role === 'owner'; }
  canViewConsumptionReports(): boolean { return true; }

  updateContactInfo(phone: string, address: Partial<Address>): void {
    this.phone = phone;
    this.address = { ...this.address, ...address };
  }
}

export interface UserCredentials { email: string; password: string; }
export interface UserSession { userId: string; token: string; expiresAt: Date; role: UserRole; }
