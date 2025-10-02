import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tenant } from "../tenants/tenant.entity";

export enum UserRole {
  SUPER_ADMIN = "super_admin", // Platform administrator
  TENANT_ADMIN = "tenant_admin", // Business owner/administrator
  TENANT_USER = "tenant_user", // Business user/employee
  CUSTOMER = "customer", // End customer (optional)
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ select: false }) // Exclude from default selections
  passwordHash: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.TENANT_USER,
  })
  role: UserRole;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: "json", nullable: true })
  permissions: string[]; // Specific permissions within tenant

  @Column({ type: "json", nullable: true })
  preferences: {
    timezone?: string;
    language?: string;
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Multi-tenant relationship
  @Column({ nullable: true }) // Super admins won't have a tenant
  tenantId: string;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  // Helper methods
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }

  get isTenantAdmin(): boolean {
    return this.role === UserRole.TENANT_ADMIN;
  }

  get canManageTenant(): boolean {
    return (
      this.role === UserRole.TENANT_ADMIN || this.role === UserRole.SUPER_ADMIN
    );
  }
}
