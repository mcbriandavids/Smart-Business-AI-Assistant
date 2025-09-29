import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
// import { Notification } from "../notifications/notification.entity"; // Commented out until notification entity is created

export enum CustomerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  VIP = "vip",
  BLOCKED = "blocked",
}

export enum PreferredContact {
  SMS = "sms",
  WHATSAPP = "whatsapp",
  EMAIL = "email",
  PHONE = "phone",
}

@Entity("customers")
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  whatsappNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  location: string;

  @Column({
    type: "simple-enum",
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  @Column({
    type: "simple-enum",
    enum: PreferredContact,
    default: PreferredContact.SMS,
  })
  preferredContact: PreferredContact;

  @Column("simple-json", { nullable: true })
  preferences: {
    productCategories?: string[];
    priceRange?: { min: number; max: number };
    deliveryTimes?: string[];
    notifications?: {
      newProducts: boolean;
      priceUpdates: boolean;
      stockAlerts: boolean;
      promotions: boolean;
    };
  };

  @Column({ nullable: true })
  notes: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalPurchases: number;

  @Column({ type: "int", default: 0 })
  purchaseCount: number;

  @Column({ nullable: true })
  lastPurchaseDate: Date;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  // Relationship will be enabled when Notification entity is created
  // @OneToMany(() => Notification, (notification) => notification.customer)
  // notifications: Notification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Simplified interface for current in-memory storage usage
// This allows us to use basic customer data while the full TypeORM entity is ready for database integration
export interface SimpleCustomerData {
  id: string;
  name: string;
  phoneNumber?: string; // For compatibility with entity
  phone?: string; // For compatibility with frontend
  email?: string;
  whatsappNumber?: string;
  address?: string;
  status?: CustomerStatus;
  preferredContact?: PreferredContact;
  preferences?: {
    productCategories?: string[];
    priceRange?: { min: number; max: number };
    deliveryTimes?: string[];
    notifications?: {
      newProducts: boolean;
      priceUpdates: boolean;
      stockAlerts: boolean;
      promotions: boolean;
    };
  };
  notes?: string;
  totalPurchases?: number;
  purchaseCount?: number;
  lastPurchaseDate?: Date;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
