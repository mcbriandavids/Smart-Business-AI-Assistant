import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

export enum TenantStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  TRIAL = "trial",
}

export enum TenantPlan {
  BASIC = "basic",
  PREMIUM = "premium",
  ENTERPRISE = "enterprise",
}

@Entity("tenants")
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  subdomain: string; // e.g., "acme-corp" for acme-corp.yourdomain.com

  @Column()
  ownerEmail: string;

  @Column({
    type: "enum",
    enum: TenantStatus,
    default: TenantStatus.TRIAL,
  })
  status: TenantStatus;

  @Column({
    type: "enum",
    enum: TenantPlan,
    default: TenantPlan.BASIC,
  })
  plan: TenantPlan;

  @Column({ type: "json", nullable: true })
  settings: {
    timezone?: string;
    currency?: string;
    notifications?: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
    };
    branding?: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
  };

  @Column({ type: "date", nullable: true })
  trialEndsAt: Date;

  @Column({ type: "int", default: 0 })
  userLimit: number;

  @Column({ type: "int", default: 0 })
  customerLimit: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  // @OneToMany(() => User, user => user.tenant)
  // users: User[];

  // @OneToMany(() => Customer, customer => customer.tenant)
  // customers: Customer[];
}
