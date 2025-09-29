import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { NotificationsService, CreateNotificationDto } from './notifications.service';
import { 
  NotificationType, 
  NotificationChannel, 
  Language,
  Notification 
} from './notification.entity';

export interface ProductAlertDto {
  customerId: string;
  productId: string;
  alertType: 'restock' | 'price_drop' | 'back_in_stock' | 'low_stock';
  threshold?: number;
  targetPrice?: number;
}

export interface FlashSaleDto {
  productIds: string[];
  discount: number;
  expiresAt: string; // ISO date string
}

export interface OrderUpdateDto {
  customerId: string;
  orderId: string;
  status: string;
  deliveryInfo?: any;
}

export interface ScheduleNotificationDto {
  customerId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  scheduledFor: string; // ISO date string
  metadata?: any;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async createNotification(@Body() dto: CreateNotificationDto) {
    try {
      const notification = await this.notificationsService.createNotification(dto);
      return {
        success: true,
        data: notification,
        message: 'Notification created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/send')
  async sendNotification(@Param('id') id: string) {
    try {
      const success = await this.notificationsService.sendNotification(id);
      return {
        success,
        message: success ? 'Notification sent successfully' : 'Failed to send notification',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('customer/:customerId')
  async getCustomerNotifications(
    @Param('customerId') customerId: string,
    @Query('limit') limit?: number,
  ) {
    try {
      const notifications = await this.notificationsService.getCustomerNotifications(
        customerId,
        limit,
      );
      return {
        success: true,
        data: notifications,
        count: notifications.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('customer/:customerId/unread-count')
  async getUnreadCount(@Param('customerId') customerId: string) {
    try {
      const count = await this.notificationsService.getUnreadCount(customerId);
      return {
        success: true,
        data: { unreadCount: count },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/mark-read')
  async markAsRead(@Param('id') id: string) {
    try {
      await this.notificationsService.markAsRead(id);
      return {
        success: true,
        message: 'Notification marked as read',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/mark-delivered')
  async markAsDelivered(@Param('id') id: string) {
    try {
      await this.notificationsService.markAsDelivered(id);
      return {
        success: true,
        message: 'Notification marked as delivered',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Smart notifications endpoints
  @Post('product-alert')
  async createProductAlert(@Body() dto: ProductAlertDto) {
    try {
      await this.notificationsService.createProductAlert(
        dto.customerId,
        dto.productId,
        dto.alertType,
        dto.threshold,
        dto.targetPrice,
      );
      return {
        success: true,
        message: 'Product alert created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('flash-sale')
  async createFlashSale(@Body() dto: FlashSaleDto) {
    try {
      await this.notificationsService.createFlashSaleAlert(
        dto.productIds,
        dto.discount,
        new Date(dto.expiresAt),
      );
      return {
        success: true,
        message: 'Flash sale notifications created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('order-update')
  async createOrderUpdate(@Body() dto: OrderUpdateDto) {
    try {
      await this.notificationsService.createOrderUpdate(
        dto.customerId,
        dto.orderId,
        dto.status,
        dto.deliveryInfo,
      );
      return {
        success: true,
        message: 'Order update notification created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('schedule')
  async scheduleNotification(@Body() dto: ScheduleNotificationDto) {
    try {
      const notificationId = await this.notificationsService.scheduleNotification(
        dto.customerId,
        dto.type,
        dto.channel,
        dto.title,
        dto.message,
        new Date(dto.scheduledFor),
        dto.metadata,
      );
      return {
        success: true,
        data: { notificationId },
        message: 'Notification scheduled successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('schedule/:id')
  async cancelScheduledNotification(@Param('id') id: string) {
    try {
      const success = await this.notificationsService.cancelScheduledNotification(id);
      return {
        success,
        message: success 
          ? 'Scheduled notification cancelled successfully' 
          : 'Failed to cancel notification',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Analytics endpoints
  @Get('stats')
  async getNotificationStats() {
    try {
      const stats = await this.notificationsService.getNotificationStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/counts')
  async getCounts() {
    try {
      const [scheduled, pending] = await Promise.all([
        this.notificationsService.getScheduledCount(),
        this.notificationsService.getPendingCount(),
      ]);
      return {
        success: true,
        data: {
          scheduled,
          pending,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Language and localization endpoints
  @Get('languages')
  async getAvailableLanguages() {
    try {
      const languages = await this.notificationsService.getAvailableLanguages();
      return {
        success: true,
        data: languages,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('translate')
  async translateMessage(
    @Body() dto: {
      templateKey: string;
      language: Language;
      variables?: Record<string, any>;
    },
  ) {
    try {
      const translation = await this.notificationsService.translateMessage(
        dto.templateKey,
        dto.language,
        dto.variables,
      );
      return {
        success: true,
        data: translation,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}