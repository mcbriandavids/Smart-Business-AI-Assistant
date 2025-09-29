import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { NotificationChannel, NotificationType, Language, NotificationPriority } from './notification.entity';

export enum ScheduleType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
  CONDITIONAL = 'conditional',
}

export enum RecurrencePattern {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

@Entity('notification_schedules')
export class NotificationSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ScheduleType,
  })
  scheduleType: ScheduleType;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  notificationType: NotificationType;

  @Column({
    type: 'json',
  })
  channels: NotificationChannel[];

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.ENGLISH,
  })
  defaultLanguage: Language;

  @Column()
  title: string;

  @Column('text')
  message: string;

  // For one-time schedules
  @Column({ type: 'timestamp', nullable: true })
  scheduledFor?: Date;

  // For recurring schedules
  @Column({
    type: 'enum',
    enum: RecurrencePattern,
    nullable: true,
  })
  recurrencePattern?: RecurrencePattern;

  @Column({ nullable: true })
  cronExpression?: string;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  // For conditional schedules
  @Column({ type: 'json', nullable: true })
  conditions?: {
    productAvailable?: string[];
    priceDropThreshold?: number;
    stockLevelBelow?: number;
    customerSegment?: string[];
    timeConditions?: {
      beforeTime?: string;
      afterTime?: string;
      daysOfWeek?: number[];
    };
  };

  // Target audience
  @Column({ type: 'json', nullable: true })
  targetCustomers?: {
    customerIds?: string[];
    segments?: string[];
    filters?: {
      location?: string[];
      interests?: string[];
      purchaseHistory?: boolean;
      loyaltyTier?: string[];
    };
  };

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  executionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastExecutedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextExecutionAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}