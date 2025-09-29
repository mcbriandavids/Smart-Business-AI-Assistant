import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { SmartNotificationService } from "./smart-notification.service";
import { NotificationSchedulerService } from "./notification-scheduler.service";
import { MultiLanguageService } from "./multi-language.service";
import { Notification } from "./notification.entity";
import { NotificationTemplate } from "./notification-template.entity";
import { NotificationSchedule } from "./notification-schedule.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationTemplate,
      NotificationSchedule,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    SmartNotificationService,
    NotificationSchedulerService,
    MultiLanguageService,
  ],
  exports: [
    NotificationsService,
    SmartNotificationService,
    NotificationSchedulerService,
    MultiLanguageService,
  ],
})
export class NotificationsModule {}
