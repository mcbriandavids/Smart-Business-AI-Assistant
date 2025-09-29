import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual, LessThan } from "typeorm";
import {
  Notification,
  NotificationStatus,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  Language,
} from "../notification.entity";

export interface SendNotificationDto {
  customerId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  priority?: NotificationPriority;
  language?: Language;
  scheduledFor?: Date;
  metadata?: any;
  personalization?: any;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>
  ) {}

  async createNotification(data: SendNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      customerId: data.customerId,
      type: data.type,
      channel: data.channel,
      title: data.title,
      message: data.message,
      priority: data.priority || NotificationPriority.MEDIUM,
      language: data.language || Language.ENGLISH,
      scheduledFor: data.scheduledFor,
      metadata: data.metadata,
      personalization: data.personalization,
      status: data.scheduledFor
        ? NotificationStatus.SCHEDULED
        : NotificationStatus.PENDING,
    });

    return await this.notificationRepository.save(notification);
  }

  async sendNotification(notificationId: string): Promise<boolean> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      this.logger.error(`Notification ${notificationId} not found`);
      return false;
    }

    try {
      // Route to appropriate channel service
      let success = false;
      switch (notification.channel) {
        case NotificationChannel.SMS:
          success = await this.sendSMS(notification);
          break;
        case NotificationChannel.WHATSAPP:
          success = await this.sendWhatsApp(notification);
          break;
        case NotificationChannel.EMAIL:
          success = await this.sendEmail(notification);
          break;
        default:
          this.logger.error(`Unsupported channel: ${notification.channel}`);
          return false;
      }

      if (success) {
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
      } else {
        notification.status = NotificationStatus.FAILED;
        notification.retryCount += 1;
        notification.nextRetryAt = new Date(Date.now() + 300000); // Retry in 5 minutes
      }

      await this.notificationRepository.save(notification);
      return success;
    } catch (error) {
      this.logger.error(
        `Failed to send notification ${notificationId}:`,
        error
      );
      notification.status = NotificationStatus.FAILED;
      notification.failureReason = error.message;
      notification.retryCount += 1;
      await this.notificationRepository.save(notification);
      return false;
    }
  }

  async markAsDelivered(notificationId: string): Promise<void> {
    await this.notificationRepository.update(notificationId, {
      status: NotificationStatus.DELIVERED,
      deliveredAt: new Date(),
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.update(notificationId, {
      readAt: new Date(),
    });
  }

  async getCustomerNotifications(
    customerId: string,
    limit = 50
  ): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { customerId },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async getUnreadCount(customerId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        customerId,
        readAt: null,
        status: NotificationStatus.DELIVERED,
      },
    });
  }

  async getPendingNotifications(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { status: NotificationStatus.PENDING },
      order: { priority: "DESC", createdAt: "ASC" },
    });
  }

  async getScheduledNotifications(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: {
        status: NotificationStatus.SCHEDULED,
        scheduledFor: LessThanOrEqual(new Date()),
      },
      order: { scheduledFor: "ASC" },
    });
  }

  async getFailedNotifications(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: {
        status: NotificationStatus.FAILED,
        retryCount: LessThan(3),
      },
      order: { nextRetryAt: "ASC" },
    });
  }

  async deleteOldNotifications(daysOld = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepository.delete({
      createdAt: LessThan(cutoffDate),
      status: NotificationStatus.DELIVERED,
    });

    return result.affected || 0;
  }

  private async sendSMS(notification: Notification): Promise<boolean> {
    // SMS implementation will be added later
    this.logger.log(`Sending SMS notification ${notification.id}`);
    // Simulate success for now
    return true;
  }

  private async sendWhatsApp(notification: Notification): Promise<boolean> {
    // WhatsApp implementation will be added later
    this.logger.log(`Sending WhatsApp notification ${notification.id}`);
    // Simulate success for now
    return true;
  }

  private async sendEmail(notification: Notification): Promise<boolean> {
    // Email implementation will be added later
    this.logger.log(`Sending Email notification ${notification.id}`);
    // Simulate success for now
    return true;
  }
}
