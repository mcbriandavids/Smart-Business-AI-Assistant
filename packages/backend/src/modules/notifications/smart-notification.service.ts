import { Injectable, Logger } from "@nestjs/common";
import { NotificationService } from "./services/notification.service";
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  Language,
} from "./notification.entity";

export interface ProductAlert {
  productId: string;
  customerId: string;
  alertType: "restock" | "price_drop" | "back_in_stock" | "low_stock";
  threshold?: number;
  targetPrice?: number;
}

export interface SmartNotificationConfig {
  customerId: string;
  preferredChannels: NotificationChannel[];
  preferredLanguage: Language;
  timezone: string;
  quietHours: { start: string; end: string };
  frequency: "immediate" | "hourly" | "daily" | "weekly";
  interests: string[];
}

@Injectable()
export class SmartNotificationService {
  private readonly logger = new Logger(SmartNotificationService.name);

  constructor(private readonly notificationService: NotificationService) {}

  async createProductAvailabilityAlert(alert: ProductAlert): Promise<void> {
    const { customerId, productId, alertType } = alert;

    // Get customer preferences (mock for now)
    const config = await this.getCustomerConfig(customerId);

    let title: string;
    let message: string;
    let type: NotificationType;

    switch (alertType) {
      case "restock":
        title = "Product Back in Stock!";
        message = `Great news! The product you wanted is now available.`;
        type = NotificationType.RESTOCK_ALERT;
        break;
      case "price_drop":
        title = "Price Drop Alert!";
        message = `The price has dropped on a product you\'re watching.`;
        type = NotificationType.PRICE_DROP;
        break;
      case "back_in_stock":
        title = "Back in Stock!";
        message = `A product from your wishlist is back in stock.`;
        type = NotificationType.PRODUCT_AVAILABLE;
        break;
      case "low_stock":
        title = "Limited Stock Alert!";
        message = `Hurry! Only a few items left in stock.`;
        type = NotificationType.LIMITED_STOCK;
        break;
    }

    // Send to all preferred channels
    for (const channel of config.preferredChannels) {
      await this.notificationService.createNotification({
        customerId,
        type,
        channel,
        title,
        message,
        priority: this.getPriorityForAlert(alertType),
        language: config.preferredLanguage,
        metadata: {
          productId,
          alertType,
          threshold: alert.threshold,
          targetPrice: alert.targetPrice,
        },
      });
    }
  }

  async createPersonalizedRecommendation(
    customerId: string,
    recommendations: any[]
  ): Promise<void> {
    const config = await this.getCustomerConfig(customerId);

    const title = "Personalized Recommendations";
    const message = `We found ${recommendations.length} products you might love!`;

    for (const channel of config.preferredChannels) {
      await this.notificationService.createNotification({
        customerId,
        type: NotificationType.PERSONALIZED_RECOMMENDATION,
        channel,
        title,
        message,
        priority: NotificationPriority.LOW,
        language: config.preferredLanguage,
        metadata: {
          recommendations,
          generatedAt: new Date().toISOString(),
        },
        personalization: {
          interests: config.interests,
        },
      });
    }
  }

  async createFlashSaleAlert(
    productIds: string[],
    discount: number,
    expiresAt: Date
  ): Promise<void> {
    // This would typically query customers interested in these products
    const interestedCustomers = await this.getInterestedCustomers(productIds);

    const title = `Flash Sale: ${discount}% Off!`;
    const message = `Limited time offer on your favorite products. Hurry, sale ends soon!`;

    for (const customerId of interestedCustomers) {
      const config = await this.getCustomerConfig(customerId);

      for (const channel of config.preferredChannels) {
        await this.notificationService.createNotification({
          customerId,
          type: NotificationType.FLASH_SALE,
          channel,
          title,
          message,
          priority: NotificationPriority.HIGH,
          language: config.preferredLanguage,
          metadata: {
            productIds,
            discount,
            expiresAt: expiresAt.toISOString(),
            actionUrl: "/flash-sale",
          },
        });
      }
    }
  }

  async createOrderStatusUpdate(
    customerId: string,
    orderId: string,
    status: string,
    deliveryInfo?: any
  ): Promise<void> {
    const config = await this.getCustomerConfig(customerId);

    let title: string;
    let message: string;
    let type: NotificationType;

    switch (status) {
      case "confirmed":
        title = "Order Confirmed";
        message = "Your order has been confirmed and is being processed.";
        type = NotificationType.ORDER_CONFIRMATION;
        break;
      case "shipped":
        title = "Order Shipped";
        message = "Your order is on its way! Track your package for updates.";
        type = NotificationType.DELIVERY_UPDATE;
        break;
      case "delivered":
        title = "Order Delivered";
        message = "Your order has been delivered. Enjoy your purchase!";
        type = NotificationType.DELIVERY_UPDATE;
        break;
      default:
        title = "Order Update";
        message = `Your order status has been updated to: ${status}`;
        type = NotificationType.DELIVERY_UPDATE;
    }

    for (const channel of config.preferredChannels) {
      await this.notificationService.createNotification({
        customerId,
        type,
        channel,
        title,
        message,
        priority: NotificationPriority.MEDIUM,
        language: config.preferredLanguage,
        metadata: {
          orderId,
          status,
          deliveryInfo,
        },
      });
    }
  }

  async createLoyaltyReward(
    customerId: string,
    rewardType: string,
    value: number
  ): Promise<void> {
    const config = await this.getCustomerConfig(customerId);

    const title = "Loyalty Reward Earned!";
    const message = `Congratulations! You've earned a ${rewardType} worth ${value} points.`;

    for (const channel of config.preferredChannels) {
      await this.notificationService.createNotification({
        customerId,
        type: NotificationType.LOYALTY_REWARD,
        channel,
        title,
        message,
        priority: NotificationPriority.LOW,
        language: config.preferredLanguage,
        metadata: {
          rewardType,
          value,
          earnedAt: new Date().toISOString(),
        },
      });
    }
  }

  private getPriorityForAlert(alertType: string): NotificationPriority {
    switch (alertType) {
      case "low_stock":
        return NotificationPriority.HIGH;
      case "price_drop":
        return NotificationPriority.MEDIUM;
      case "restock":
      case "back_in_stock":
        return NotificationPriority.MEDIUM;
      default:
        return NotificationPriority.LOW;
    }
  }

  private async getCustomerConfig(
    customerId: string
  ): Promise<SmartNotificationConfig> {
    // Mock implementation - would fetch from database
    return {
      customerId,
      preferredChannels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      preferredLanguage: Language.ENGLISH,
      timezone: "UTC",
      quietHours: { start: "22:00", end: "08:00" },
      frequency: "immediate",
      interests: ["electronics", "fashion", "home"],
    };
  }

  private async getInterestedCustomers(
    productIds: string[]
  ): Promise<string[]> {
    // Mock implementation - would query database for customers who:
    // - Have these products in wishlist
    // - Have purchased similar products
    // - Have shown interest in these categories
    return ["customer-1", "customer-2", "customer-3"];
  }
}
