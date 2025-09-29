// Notification entity with basic TypeScript types (will be converted to TypeORM later)
export enum NotificationStatus {
  PENDING = "pending",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
}

export enum NotificationType {
  PRODUCT_AVAILABLE = "product_available",
  PRICE_UPDATE = "price_update",
  PROMOTION = "promotion",
  DELIVERY_UPDATE = "delivery_update",
  STOCK_ALERT = "stock_alert",
  GENERAL = "general",
}

export enum NotificationChannel {
  SMS = "sms",
  WHATSAPP = "whatsapp",
  EMAIL = "email",
}

export class Notification {
  id: string;
  customerId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  status: NotificationStatus;
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  metadata?: any;
  customer?: any; // Will be Customer entity
  createdAt: Date;
  updatedAt: Date;
}
