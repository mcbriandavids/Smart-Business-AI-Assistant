import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { NotificationService } from "./services/notification.service";
import { SmartNotificationService } from "./smart-notification.service";
import {
  NotificationStatus,
  NotificationType,
  NotificationChannel,
  Language,
} from "./notification.entity";

export interface ScheduledNotificationJob {
  id: string;
  customerId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  cronExpression: string;
  isActive: boolean;
  metadata?: any;
}

export interface BulkNotificationJob {
  customerIds: string[];
  type: NotificationType;
  channels: NotificationChannel[];
  title: string;
  message: string;
  scheduledFor?: Date;
  metadata?: any;
}

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);
  private scheduledJobs: Map<string, ScheduledNotificationJob> = new Map();

  constructor(
    private readonly notificationService: NotificationService,
    private readonly smartNotificationService: SmartNotificationService
  ) {}

  // Process scheduled notifications every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledNotifications(): Promise<void> {
    try {
      const notifications =
        await this.notificationService.getScheduledNotifications();

      for (const notification of notifications) {
        await this.notificationService.sendNotification(notification.id);
      }

      if (notifications.length > 0) {
        this.logger.log(
          `Processed ${notifications.length} scheduled notifications`
        );
      }
    } catch (error) {
      this.logger.error("Error processing scheduled notifications:", error);
    }
  }

  // Process failed notifications for retry every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedNotifications(): Promise<void> {
    try {
      const failedNotifications =
        await this.notificationService.getFailedNotifications();

      for (const notification of failedNotifications) {
        if (
          notification.nextRetryAt &&
          new Date() >= notification.nextRetryAt
        ) {
          await this.notificationService.sendNotification(notification.id);
        }
      }

      if (failedNotifications.length > 0) {
        this.logger.log(
          `Retried ${failedNotifications.length} failed notifications`
        );
      }
    } catch (error) {
      this.logger.error("Error retrying failed notifications:", error);
    }
  }

  // Send daily summaries at 9 AM
  @Cron("0 9 * * *")
  async sendDailySummaries(): Promise<void> {
    try {
      // This would fetch customers who opted for daily summaries
      const customers = await this.getCustomersForDailySummary();

      for (const customerId of customers) {
        await this.createDailySummary(customerId);
      }

      this.logger.log(`Sent daily summaries to ${customers.length} customers`);
    } catch (error) {
      this.logger.error("Error sending daily summaries:", error);
    }
  }

  // Send weekly reports on Mondays at 10 AM
  @Cron("0 10 * * 1")
  async sendWeeklyReports(): Promise<void> {
    try {
      const customers = await this.getCustomersForWeeklyReport();

      for (const customerId of customers) {
        await this.createWeeklyReport(customerId);
      }

      this.logger.log(`Sent weekly reports to ${customers.length} customers`);
    } catch (error) {
      this.logger.error("Error sending weekly reports:", error);
    }
  }

  // Cleanup old notifications daily at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNotifications(): Promise<void> {
    try {
      const deletedCount =
        await this.notificationService.deleteOldNotifications(30);
      this.logger.log(`Cleaned up ${deletedCount} old notifications`);
    } catch (error) {
      this.logger.error("Error cleaning up old notifications:", error);
    }
  }

  async scheduleNotification(
    customerId: string,
    type: NotificationType,
    channel: NotificationChannel,
    title: string,
    message: string,
    scheduledFor: Date,
    metadata?: any
  ): Promise<string> {
    const notification = await this.notificationService.createNotification({
      customerId,
      type,
      channel,
      title,
      message,
      scheduledFor,
      metadata,
    });

    this.logger.log(
      `Scheduled notification ${notification.id} for ${scheduledFor}`
    );
    return notification.id;
  }

  async scheduleRecurringNotification(
    job: ScheduledNotificationJob
  ): Promise<void> {
    this.scheduledJobs.set(job.id, job);
    this.logger.log(
      `Added recurring notification job ${job.id} with pattern ${job.cronExpression}`
    );
  }

  async cancelScheduledNotification(notificationId: string): Promise<boolean> {
    // Update notification status to cancelled
    const updated = await this.notificationService.getCustomerNotifications(
      notificationId,
      1
    );
    if (updated.length > 0) {
      // Update status logic would go here
      this.logger.log(`Cancelled scheduled notification ${notificationId}`);
      return true;
    }
    return false;
  }

  async scheduleBulkNotification(job: BulkNotificationJob): Promise<string[]> {
    const notificationIds: string[] = [];

    for (const customerId of job.customerIds) {
      for (const channel of job.channels) {
        const notification = await this.notificationService.createNotification({
          customerId,
          type: job.type,
          channel,
          title: job.title,
          message: job.message,
          scheduledFor: job.scheduledFor,
          metadata: job.metadata,
        });
        notificationIds.push(notification.id);
      }
    }

    this.logger.log(`Scheduled ${notificationIds.length} bulk notifications`);
    return notificationIds;
  }

  async getScheduledNotificationsCount(): Promise<number> {
    const notifications =
      await this.notificationService.getScheduledNotifications();
    return notifications.length;
  }

  async getPendingNotificationsCount(): Promise<number> {
    const notifications =
      await this.notificationService.getPendingNotifications();
    return notifications.length;
  }

  private async createDailySummary(customerId: string): Promise<void> {
    // Mock daily summary - would include:
    // - New products in watched categories
    // - Price changes on wishlist items
    // - Order updates
    // - Recommendations

    await this.notificationService.createNotification({
      customerId,
      type: NotificationType.WEEKLY_UPDATE,
      channel: NotificationChannel.EMAIL,
      title: "Your Daily Summary",
      message: "Here's what happened today with your interests and orders.",
      metadata: {
        summaryType: "daily",
        generatedAt: new Date().toISOString(),
      },
    });
  }

  private async createWeeklyReport(customerId: string): Promise<void> {
    // Mock weekly report - would include:
    // - Weekly sales summary
    // - New arrivals in interest categories
    // - Loyalty points earned
    // - Upcoming sales/events

    await this.notificationService.createNotification({
      customerId,
      type: NotificationType.WEEKLY_UPDATE,
      channel: NotificationChannel.EMAIL,
      title: "Your Weekly Report",
      message: "Here's your weekly summary of activities and recommendations.",
      metadata: {
        summaryType: "weekly",
        generatedAt: new Date().toISOString(),
      },
    });
  }

  private async getCustomersForDailySummary(): Promise<string[]> {
    // Mock implementation - would query customers who opted for daily summaries
    return ["customer-1", "customer-2"];
  }

  private async getCustomersForWeeklyReport(): Promise<string[]> {
    // Mock implementation - would query customers who opted for weekly reports
    return ["customer-1", "customer-2", "customer-3"];
  }
}
