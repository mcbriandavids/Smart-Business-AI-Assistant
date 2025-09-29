import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

// Enhanced notification entity for smart notifications system
export enum NotificationStatus {
  PENDING = "pending",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
  SCHEDULED = "scheduled",
  CANCELLED = "cancelled",
}

export enum NotificationType {
  PRODUCT_AVAILABLE = "product_available",
  PRICE_UPDATE = "price_update",
  PRICE_DROP = "price_drop",
  FLASH_SALE = "flash_sale",
  LIMITED_STOCK = "limited_stock",
  RESTOCK_ALERT = "restock_alert",
  PROMOTION = "promotion",
  DELIVERY_UPDATE = "delivery_update",
  ORDER_CONFIRMATION = "order_confirmation",
  LOYALTY_REWARD = "loyalty_reward",
  PERSONALIZED_RECOMMENDATION = "personalized_recommendation",
  WEEKLY_UPDATE = "weekly_update",
  GENERAL = "general",
}

export enum NotificationChannel {
  SMS = "sms",
  WHATSAPP = "whatsapp",
  EMAIL = "email",
  PUSH = "push",
  VOICE = "voice",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum Language {
  ENGLISH = "en",
  PIDGIN = "pcm",
  YORUBA = "yo",
  HAUSA = "ha",
  IGBO = "ig",
  FRENCH = "fr",
}

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  customerId: string;

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: "enum",
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column({
    type: "enum",
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @Column({
    type: "enum",
    enum: Language,
    default: Language.ENGLISH,
  })
  language: Language;

  @Column()
  title: string;

  @Column("text")
  message: string;

  @Column({
    type: "enum",
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ nullable: true })
  templateId?: string;

  @Column({ type: "timestamp", nullable: true })
  scheduledFor?: Date;

  @Column({ type: "timestamp", nullable: true })
  sentAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  deliveredAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  readAt?: Date;

  @Column({ type: "json", nullable: true })
  metadata?: {
    productId?: string;
    orderId?: string;
    deliveryId?: string;
    originalPrice?: number;
    newPrice?: number;
    discount?: number;
    stockLevel?: number;
    expiresAt?: string;
    actionUrl?: string;
    imageUrl?: string;
    tags?: string[];
    variables?: Record<string, any>;
  };

  @Column({ type: "json", nullable: true })
  personalization?: {
    customerName?: string;
    preferredTime?: string;
    frequency?: string;
    interests?: string[];
    purchaseHistory?: string[];
  };

  @Column({ nullable: true })
  failureReason?: string;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ type: "timestamp", nullable: true })
  nextRetryAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations will be added when Customer entity is available
  // @ManyToOne(() => Customer)
  // @JoinColumn({ name: 'customerId' })
  // customer?: Customer;
}
