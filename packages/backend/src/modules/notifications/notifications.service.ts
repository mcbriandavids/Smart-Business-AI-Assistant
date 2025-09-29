import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { SmartNotificationService } from './smart-notification.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { MultiLanguageService } from './multi-language.service';
import { 
  NotificationType, 
  NotificationChannel, 
  NotificationPriority,
  Language,
  Notification 
} from './notification.entity';

export interface CreateNotificationDto {
  customerId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title?: string;
  message?: string;
  templateKey?: string;
  priority?: NotificationPriority;
  language?: Language;
  scheduledFor?: Date;
  metadata?: any;
  variables?: Record<string, any>;
}

export interface NotificationStatsDto {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalPending: number;
  totalScheduled: number;
  deliveryRate: number;
  channelStats: Record<NotificationChannel, number>;
  typeStats: Record<NotificationType, number>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly smartNotificationService: SmartNotificationService,
    private readonly schedulerService: NotificationSchedulerService,
    private readonly multiLanguageService: MultiLanguageService,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    let title = dto.title;
    let message = dto.message;

    // If template key is provided, translate the notification
    if (dto.templateKey) {
      const translated = await this.multiLanguageService.translateNotification(
        dto.templateKey,
        dto.language || Language.ENGLISH,
        dto.variables,
      );
      title = translated.title;
      message = translated.message;
    }

    if (!title || !message) {
      throw new Error('Title and message are required when not using a template');
    }

    return await this.notificationService.createNotification({
      customerId: dto.customerId,
      type: dto.type,
      channel: dto.channel,
      title,
      message,
      priority: dto.priority,
      language: dto.language,
      scheduledFor: dto.scheduledFor,
      metadata: dto.metadata,
    });
  }

  async sendNotification(notificationId: string): Promise<boolean> {
    return await this.notificationService.sendNotification(notificationId);
  }

  async getCustomerNotifications(
    customerId: string,
    limit = 50,
  ): Promise<Notification[]> {
    return await this.notificationService.getCustomerNotifications(customerId, limit);
  }

  async getUnreadCount(customerId: string): Promise<number> {
    return await this.notificationService.getUnreadCount(customerId);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationService.markAsRead(notificationId);
  }

  async markAsDelivered(notificationId: string): Promise<void> {
    await this.notificationService.markAsDelivered(notificationId);
  }

  // Smart notification methods
  async createProductAlert(
    customerId: string,
    productId: string,
    alertType: 'restock' | 'price_drop' | 'back_in_stock' | 'low_stock',
    threshold?: number,
    targetPrice?: number,
  ): Promise<void> {
    await this.smartNotificationService.createProductAvailabilityAlert({
      customerId,
      productId,
      alertType,
      threshold,
      targetPrice,
    });
  }

  async createFlashSaleAlert(
    productIds: string[],
    discount: number,
    expiresAt: Date,
  ): Promise<void> {
    await this.smartNotificationService.createFlashSaleAlert(
      productIds,
      discount,
      expiresAt,
    );
  }

  async createOrderUpdate(
    customerId: string,
    orderId: string,
    status: string,
    deliveryInfo?: any,
  ): Promise<void> {
    await this.smartNotificationService.createOrderStatusUpdate(
      customerId,
      orderId,
      status,
      deliveryInfo,
    );
  }

  async createPersonalizedRecommendation(
    customerId: string,
    recommendations: any[],
  ): Promise<void> {
    await this.smartNotificationService.createPersonalizedRecommendation(
      customerId,
      recommendations,
    );
  }

  async createLoyaltyReward(
    customerId: string,
    rewardType: string,
    value: number,
  ): Promise<void> {
    await this.smartNotificationService.createLoyaltyReward(
      customerId,
      rewardType,
      value,
    );
  }

  // Scheduling methods
  async scheduleNotification(
    customerId: string,
    type: NotificationType,
    channel: NotificationChannel,
    title: string,
    message: string,
    scheduledFor: Date,
    metadata?: any,
  ): Promise<string> {
    return await this.schedulerService.scheduleNotification(
      customerId,
      type,
      channel,
      title,
      message,
      scheduledFor,
      metadata,
    );
  }

  async cancelScheduledNotification(notificationId: string): Promise<boolean> {
    return await this.schedulerService.cancelScheduledNotification(notificationId);
  }

  // Analytics and stats
  async getNotificationStats(): Promise<NotificationStatsDto> {
    // Mock implementation - would query database for actual stats
    return {
      totalSent: 1250,
      totalDelivered: 1180,
      totalFailed: 45,
      totalPending: 25,
      totalScheduled: 150,
      deliveryRate: 94.4,
      channelStats: {
        [NotificationChannel.EMAIL]: 800,
        [NotificationChannel.SMS]: 350,
        [NotificationChannel.WHATSAPP]: 100,
        [NotificationChannel.PUSH]: 45,
        [NotificationChannel.VOICE]: 5,
      },
      typeStats: {
        [NotificationChannel.EMAIL]: 800,
        [NotificationChannel.SMS]: 350,
        [NotificationChannel.WHATSAPP]: 100,
        [NotificationChannel.PUSH]: 45,
        [NotificationChannel.VOICE]: 5,
      } as any,
    };
  }

  async getScheduledCount(): Promise<number> {
    return await this.schedulerService.getScheduledNotificationsCount();
  }

  async getPendingCount(): Promise<number> {
    return await this.schedulerService.getPendingNotificationsCount();
  }

  // Language and localization
  async getAvailableLanguages(): Promise<Language[]> {
    return await this.multiLanguageService.getAvailableLanguages();
  }

  async translateMessage(
    templateKey: string,
    language: Language,
    variables?: Record<string, any>,
  ): Promise<{ title: string; message: string }> {
    const result = await this.multiLanguageService.translateNotification(
      templateKey,
      language,
      variables,
    );
    return {
      title: result.title,
      message: result.message,
    };
  }
}